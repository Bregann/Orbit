import { noAuthApiClient } from '@/helpers/apiClient'
import { keychainHelper } from '@/helpers/keychainHelper'
import { LoginUserRequest } from '@/interfaces/api/login/LoginUserRequest'
import { LoginUserResponse } from '@/interfaces/api/login/LoginUserResponse'
import { useRouter } from 'expo-router'
import { createContext, useContext, useEffect, useState } from 'react'

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
    const accessToken = await keychainHelper.getAccessToken()
    console.log(accessToken ?? 'is null')
    const isLoggedIn = accessToken !== null
    setIsAuthenticated(isLoggedIn)
  }

  const logOut = async (): Promise<void> => {
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
      console.log('Login response status:', response.status)
      if (response.status === 401) {
        return false
      }

      if (response.status === 200 && response.data) {
        await keychainHelper.setAccessToken(response.data.accessToken)
        await keychainHelper.setRefreshToken(response.data.refreshToken)
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
    checkAuthStatus()
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, logOut, checkAuthStatus, attemptLogin }}>
      {children}
    </AuthContext.Provider>
  )
}