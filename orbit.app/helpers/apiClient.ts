import { RefreshTokenRequest } from '@/interfaces/api/login/RefreshTokenRequest'
import { RefreshTokenResponse } from '@/interfaces/api/login/RefreshTokenResponse'
import axios from 'axios'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { decodeJwt, fingerprint, logAuthEvent } from './authDebugLog'
import { keychainHelper } from './keychainHelper'

const authApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.208:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus: (status) => status < 500 && status !== 401,
})

// Holds the in-flight refresh so that concurrent 401s all await the same
// network call instead of each POSTing the (single-use) refresh token.
let refreshPromise: Promise<string> | null = null

const noAuthApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.208:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus (status) {
    return status < 500
  },
})


const forceLogout = async (reason: string): Promise<void> => {
  logAuthEvent('logout_forced', { reason })
  await keychainHelper.deleteTokens()
  setTimeout(() => {
    router.replace('/(auth)/login')
  }, 100)
}

// Performs a single refresh and returns the new access token. Always clears
// refreshPromise when settled so a later 401 can refresh again.
//
// Crucially, this only destroys local tokens when the SERVER explicitly
// rejects the refresh token (401/403). A transient failure — no connectivity,
// DNS failure, timeout, 5xx — leaves the stored tokens intact so the next
// request can retry. The refresh token is valid for 30 days server-side;
// throwing it away because the phone was asleep or off-wifi is what was
// logging the user out after an hour or two.
const performRefresh = async (): Promise<string> => {
  try {
    const refreshToken = await keychainHelper.getRefreshToken()

    if (refreshToken === null) {
      await forceLogout('no refresh token in keychain')
      throw new Error('No refresh token available')
    }

    logAuthEvent('refresh_start', { refreshToken: fingerprint(refreshToken) })
    const request: RefreshTokenRequest = { refreshToken }

    let response
    try {
      response = await noAuthApiClient.post<RefreshTokenResponse>('/api/Auth/RefreshAppToken', request)
    } catch (networkError) {
      // noAuthApiClient only rejects for >=500 or a transport-level failure.
      // Neither means the refresh token is bad, so keep it and retry later.
      logAuthEvent('refresh_network_error', {
        message: networkError instanceof Error ? networkError.message : String(networkError),
        keptTokens: true,
      })
      throw networkError
    }

    // noAuthApiClient treats 4xx as success (validateStatus: status < 500),
    // so check the status manually.
    if (response.status === 401 || response.status === 403) {
      // The server has definitively rejected this refresh token (revoked,
      // expired, or unknown). This is the only case where logging out is right.
      logAuthEvent('refresh_rejected', {
        status: response.status,
        // The API returns RFC 7807 ProblemDetails, so `detail` carries the
        // exact server-side reason: "revoked" vs "expired" vs "not found".
        serverDetail: (response.data as { detail?: string } | undefined)?.detail,
      })
      await forceLogout(`server rejected refresh token (${response.status})`)
      throw new Error('Refresh token rejected')
    }

    if (response.status !== 200 || !response.data?.accessToken || !response.data?.refreshToken) {
      // Unexpected shape but not an auth rejection — don't nuke the tokens.
      logAuthEvent('refresh_http_error', { status: response.status, keptTokens: true })
      throw new Error('Refresh endpoint returned invalid response')
    }

    // Persist both tokens before returning so that any queued request which
    // resolves off this promise reads a consistent pair from the keychain.
    await keychainHelper.setAccessToken(response.data.accessToken)
    await keychainHelper.setRefreshToken(response.data.refreshToken)

    const exp = decodeJwt(response.data.accessToken)?.exp
    logAuthEvent('refresh_success', {
      newRefreshToken: fingerprint(response.data.refreshToken),
      accessTokenExpiresAt: exp === undefined ? 'unknown' : new Date(exp * 1000).toISOString(),
    })

    return response.data.accessToken
  } finally {
    refreshPromise = null
  }
}

authApiClient.interceptors.request.use(async (config) => {
  const accessToken = await keychainHelper.getAccessToken()

  if (accessToken !== null) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

authApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A transport-level failure (offline, timeout, DNS) has no response at all.
    // Reject without touching auth state — the tokens are still good.
    if (error.response === undefined) {
      logAuthEvent('refresh_network_error', {
        url: error.config?.url,
        message: error.message,
        note: 'no response object; auth state untouched',
      })
      return Promise.reject(error)
    }

    // don't bother to try and retry with a 500 error
    if (error.response.status >= 500) {
      return Promise.reject(error)
    }

    // if it's errored with 401, we try to refresh the token
    if (error.response.status === 401) {
      // Don't retry the refresh call itself, otherwise a 401 from the refresh
      // endpoint would recurse.
      if (error.config?.url?.includes('/api/Auth/RefreshAppToken')) {
        return Promise.reject(error)
      }

      // Already retried once with a freshly-minted token and still got a 401.
      // The session is genuinely dead, so stop rather than loop.
      if (error.config._retry) {
        logAuthEvent('retry_exhausted', { url: error.config?.url })
        await forceLogout('401 persisted after a successful refresh')
        return Promise.reject(error)
      }

      // Claim the refresh slot synchronously, BEFORE any await in this branch.
      // Two concurrent 401s must never both reach performRefresh, or they will
      // burn the single-use refresh token against each other.
      const isLeader = refreshPromise === null
      if (isLeader) {
        refreshPromise = performRefresh()
      }

      // Capture immediately: performRefresh clears the shared slot as soon as
      // it settles, which can happen while the diagnostics below are awaiting.
      const pending = refreshPromise

      // Diagnostics only, and deliberately after the slot is claimed so the
      // awaits below cannot reopen the race. If `expired` is false here, the
      // access token was still in date and the server rejected it for another
      // reason (bad signature, clock skew, API restarted with a new JwtKey) -
      // which would point somewhere entirely different to token lifetime.
      const accessToken = await keychainHelper.getAccessToken()
      const exp = accessToken === null ? undefined : decodeJwt(accessToken)?.exp
      logAuthEvent('request_401', {
        url: error.config?.url,
        accessToken: fingerprint(accessToken),
        accessTokenExpiresAt: exp === undefined ? 'unknown' : new Date(exp * 1000).toISOString(),
        expired: exp === undefined ? 'unknown' : exp * 1000 < Date.now(),
        startedRefresh: isLeader,
      })

      try {
        const freshAccessToken = await pending
        error.config.headers['Authorization'] = `Bearer ${freshAccessToken}`
        error.config._retry = true
        return authApiClient.request(error.config)
      } catch {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export { authApiClient, noAuthApiClient }

export const resetAuthState = (): void => {
  refreshPromise = null
}

