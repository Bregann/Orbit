import axios from 'axios'
import { keychainHelper } from './keychainHelper'
import Constants from 'expo-constants'

const authApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.1:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
  validateStatus: (status) => status < 500 && status !== 401,
})

const noAuthApiClient = axios.create({
  baseURL: __DEV__ ? 'http://192.168.1.1:5053' : Constants.expoConfig?.extra?.ApiUrl || '',
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
        const { data } = await authApiClient.post('/api/auth/RefreshToken', {
          refreshToken
        })

        keychainHelper.setAccessToken(data.accessToken)
        keychainHelper.setRefreshToken(data.refreshToken)

        error.config.headers['Authorization'] = `Bearer ${data.accessToken}`

        return authApiClient.request(error.config)
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export { authApiClient, noAuthApiClient }
