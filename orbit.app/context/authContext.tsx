import { noAuthApiClient } from '@/helpers/apiClient'
import { keychainHelper } from '@/helpers/keychainHelper'
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
    setIsAuthenticated(accessToken !== null)
  }

  const logOut = async (): Promise<void> => {
    await keychainHelper.deleteTokens()
    setIsAuthenticated(false)
    router.push('/')
  }

  const attemptLogin = async (username: string, password: string): Promise<boolean> => {
    const response = await noAuthApiClient.post('/api/auth/LoginUser', {
      username,
      password
    })

    if (response.status === 401) {
      return false
    } else {
      setIsAuthenticated(true)
      console.log(response.data.accessToken)
      console.log(response.data.refreshToken)
      keychainHelper.setAccessToken(response.data.accessToken)
      keychainHelper.setRefreshToken(response.data.refreshToken)
      router.replace('/home')
      console.log('hitting')
      console.log(isAuthenticated)
    }

    return true
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