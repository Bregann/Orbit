import { noAuthApiClient, resetAuthState } from '@/helpers/apiClient'
import { decodeJwt, fingerprint, logAuthEvent } from '@/helpers/authDebugLog'
import { keychainHelper } from '@/helpers/keychainHelper'
import { LoginUserRequest } from '@/interfaces/api/login/LoginUserRequest'
import { LoginUserResponse } from '@/interfaces/api/login/LoginUserResponse'
import { useRouter } from 'expo-router'
import { createContext, useContext, useEffect, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

type ContextType = {
  isAuthenticated: boolean | null // null = loading
  logOut: () => Promise<void>
  checkAuthStatus: () => void
  attemptLogin: (email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<ContextType | undefined>(undefined)

export const useAuth = (): ContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider')
  }

  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null) // null = loading
  const router = useRouter()

  const checkAuthStatus = async (): Promise<void> => {
    // Never log the raw token - fingerprint only.
    const accessToken = await keychainHelper.getAccessToken()
    const refreshToken = await keychainHelper.getRefreshToken()
    const exp = accessToken === null ? undefined : decodeJwt(accessToken)?.exp

    logAuthEvent('token_read', {
      accessToken: fingerprint(accessToken),
      refreshToken: fingerprint(refreshToken),
      accessTokenExpiresAt: exp === undefined ? 'unknown' : new Date(exp * 1000).toISOString(),
      accessTokenExpired: exp === undefined ? 'unknown' : exp * 1000 < Date.now(),
    })

    const isLoggedIn = accessToken !== null && accessToken !== ''
    setIsAuthenticated(isLoggedIn)
  }

  const logOut = async (): Promise<void> => {
    logAuthEvent('logout_manual')
    await keychainHelper.deleteTokens()
    setIsAuthenticated(false)
    router.replace('/(auth)/login')
  }

  const attemptLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const request: LoginUserRequest = {
        email: username,
        password,
        isMobile: true,
      }

      const response = await noAuthApiClient.post<LoginUserResponse>('/api/Auth/LoginUser', request)

      if (response.status === 401) {
        return false
      }

      if (response.status === 200 && response.data) {
        resetAuthState()
        await keychainHelper.setAccessToken(response.data.accessToken)
        await keychainHelper.setRefreshToken(response.data.refreshToken)

        const exp = decodeJwt(response.data.accessToken)?.exp
        logAuthEvent('login_success', {
          refreshToken: fingerprint(response.data.refreshToken),
          accessTokenExpiresAt: exp === undefined ? 'unknown' : new Date(exp * 1000).toISOString(),
        })

        setIsAuthenticated(true)
        router.replace('/(tabs)')
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  useEffect(() => {
    logAuthEvent('app_start')
    checkAuthStatus()
  }, [])

  // The logout happens after a long background period, so record the
  // foreground/background transitions to correlate against. Re-reads the token
  // on resume, which is when a stale-token 401 is most likely to fire.
  useEffect(() => {
    let previous = AppState.currentState

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (previous.match(/inactive|background/) && next === 'active') {
        logAuthEvent('app_foreground')
        checkAuthStatus()
      } else if (next.match(/inactive|background/) && previous === 'active') {
        logAuthEvent('app_background')
      }

      previous = next
    })

    return () => subscription.remove()
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, logOut, checkAuthStatus, attemptLogin }}>
      {children}
    </AuthContext.Provider>
  )
}