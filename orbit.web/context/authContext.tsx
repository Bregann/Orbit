// context/AuthContext.tsx
'use client'

import { doPost } from '@/helpers/apiClient'
import { isTokenExpired, decodeJwt } from '@/helpers/jwtHelper'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useState, useEffect, useRef } from 'react'

type User = {
  email: string
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  login: (_email: string, _password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to get and decode current access token
  const getAccessToken = (): string | undefined => {
    const tokenRow = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
    return tokenRow !== undefined ? tokenRow.split('=')[1] : undefined
  }

  // Function to extract user from token
  const getUserFromToken = (token: string): User | null => {
    const payload = decodeJwt(token)
    if (!payload) return null

    const email = payload[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    ]
    return email ? { email } : null
  }

  // Function to schedule token refresh before expiration
  const scheduleTokenRefresh = (token: string) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const payload = decodeJwt(token)
    if (!payload || !payload.exp) return

    const expirationTime = payload.exp * 1000
    const now = Date.now()
    const timeUntilExpiry = expirationTime - now
    
    // Refresh 2 minutes before expiration (or immediately if already expired/expiring soon)
    const refreshTime = Math.max(0, timeUntilExpiry - 120000)

    console.log(`Token will be refreshed in ${Math.round(refreshTime / 1000)} seconds`)

    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('Proactively refreshing token...')
      try {
        // Trigger a page refresh which will cause the middleware to refresh the token
        router.refresh()
      } catch (error) {
        console.error('Failed to refresh token:', error)
      }
    }, refreshTime)
  }

  useEffect(() => {
    const token = getAccessToken()

    if (token !== undefined) {
      if (isTokenExpired(token)) {
        // Token is expired, trigger refresh via router
        console.log('Token expired on mount, refreshing page to trigger middleware refresh...')
        router.refresh()
        setLoading(false)
        return
      }

      const extractedUser = getUserFromToken(token)
      if (extractedUser) {
        setUser(extractedUser)
        scheduleTokenRefresh(token)
      }
    }
    setLoading(false)

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await doPost('/api/auth/LoginUser', { body: { email, password } })
    if (res.status === 200) {
      console.log('Login successful')
      
      // Get the new token and schedule refresh
      const token = getAccessToken()
      if (token) {
        const extractedUser = getUserFromToken(token)
        if (extractedUser) {
          setUser(extractedUser)
          scheduleTokenRefresh(token)
        }
      }
      
      router.replace('/')
      return true
    }
    return false
  }

  const logout = async () => {
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    await doPost('/api/auth/DeleteUserSession', {})
    document.cookie = 'accessToken=; Max-Age=0; path=/'
    document.cookie = 'refreshToken=; Max-Age=0; path=/'
    setUser(null)

    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: user !== null, user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
