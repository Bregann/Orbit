import { RefreshTokenRequest } from '@/interfaces/api/login/RefreshTokenRequest'
import { RefreshTokenResponse } from '@/interfaces/api/login/RefreshTokenResponse'
import axios from 'axios'
import Constants from 'expo-constants'
import { keychainHelper } from './keychainHelper'

const authApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.248:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus: (status) => status < 500 && status !== 401,
})

const noAuthApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.248:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus (status) {
    return status < 500
  },
})


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
    // don't bother to try and retry with a 500 error
    if (error.response.status >= 500) {
      return Promise.reject(error)
    }

    // if it's errored with 401, we try to refresh the token
    if (error.response.status === 401) {
      const refreshToken = await keychainHelper.getRefreshToken()

      if (refreshToken === null) {
        return Promise.reject(error)
      }

      try {
        const request: RefreshTokenRequest = { refreshToken }
        const { data } = await authApiClient.post<RefreshTokenResponse>('/api/Auth/RefreshToken', request)

        await keychainHelper.setAccessToken(data.accessToken)
        await keychainHelper.setRefreshToken(data.refreshToken)

        error.config.headers['Authorization'] = `Bearer ${data.accessToken}`

        return authApiClient.request(error.config)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear tokens on refresh failure
        await keychainHelper.deleteTokens()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export { authApiClient, noAuthApiClient }

