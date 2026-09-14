import { RefreshTokenRequest } from '@/interfaces/api/login/RefreshTokenRequest'
import { RefreshTokenResponse } from '@/interfaces/api/login/RefreshTokenResponse'
import axios from 'axios'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { keychainHelper } from './keychainHelper'

const authApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.208:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus: (status) => status < 500 && status !== 401,
})

// Holds the in-flight refresh so that concurrent 401s all await the same
// network call instead of each POSTing the (single-use) refresh token.
let refreshPromise: Promise<string> | null = null
let hasLoggedOut = false

const noAuthApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.208:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus (status) {
    return status < 500
  },
})


const forceLogout = async (): Promise<void> => {
  hasLoggedOut = true
  await keychainHelper.deleteTokens()
  setTimeout(() => {
    router.replace('/(auth)/login')
  }, 100)
}

// Performs a single refresh and returns the new access token. Always clears
// refreshPromise when settled so a later 401 can refresh again.
const performRefresh = async (): Promise<string> => {
  try {
    const refreshToken = await keychainHelper.getRefreshToken()

    if (refreshToken === null) {
      console.log('❌ No refresh token available')
      await forceLogout()
      throw new Error('No refresh token available')
    }

    console.log('🔑 Refreshing token...')
    const request: RefreshTokenRequest = { refreshToken }
    const response = await noAuthApiClient.post<RefreshTokenResponse>('/api/Auth/RefreshAppToken', request)

    // noAuthApiClient treats 4xx as success (validateStatus: status < 500),
    // so we must manually check for a non-2xx response to avoid using
    // undefined tokens and entering an infinite refresh loop.
    if (response.status !== 200 || !response.data?.accessToken || !response.data?.refreshToken) {
      console.error('❌ Token refresh returned non-OK or missing tokens:', response.status)
      await forceLogout()
      throw new Error('Refresh endpoint returned invalid response')
    }

    // Persist both tokens before returning so that any queued request which
    // resolves off this promise reads a consistent pair from the keychain.
    await keychainHelper.setAccessToken(response.data.accessToken)
    await keychainHelper.setRefreshToken(response.data.refreshToken)

    console.log('✅ Token refreshed successfully')
    hasLoggedOut = false

    return response.data.accessToken
  } finally {
    refreshPromise = null
  }
}

authApiClient.interceptors.request.use(async (config) => {
  const accessToken = await keychainHelper.getAccessToken()

  console.log('📤 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    hasAccessToken: !!accessToken,
  })

  if (accessToken !== null) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

authApiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
    })
    return response
  },
  async (error) => {
    console.log('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    })

    // don't bother to try and retry with a 500 error
    if (error.response.status >= 500) {
      return Promise.reject(error)
    }

    // if it's errored with 401, we try to refresh the token
    if (error.response.status === 401) {
      // If we've already logged out, don't try to refresh
      if (hasLoggedOut) {
        console.log('⛔ Already logged out, rejecting request')
        return Promise.reject(error)
      }

      // Don't retry the refresh call itself, otherwise a 401 from the refresh
      // endpoint would recurse.
      if (error.config?.url?.includes('/api/Auth/RefreshAppToken')) {
        return Promise.reject(error)
      }

      // Assigning refreshPromise synchronously (no await before this point in
      // this branch) means concurrent 401s can never both start a refresh and
      // burn the single-use refresh token against each other.
      if (refreshPromise === null) {
        console.log('🔄 Token expired, attempting refresh...')
        refreshPromise = performRefresh()
      } else {
        console.log('⏳ Refresh already in flight, waiting for it')
      }

      // Capture locally: performRefresh clears the shared slot when it settles.
      const pending = refreshPromise

      try {
        const accessToken = await pending
        error.config.headers['Authorization'] = `Bearer ${accessToken}`
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
  hasLoggedOut = false
  refreshPromise = null
}

