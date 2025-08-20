import { NextRequest, NextResponse } from 'next/server'

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://localhost:7248/api'
const API_SECRET_KEY = process.env.API_SECRET_KEY || 'supersecret'
const ACCESS_TOKEN_COOKIE = 'accessToken'
const REFRESH_TOKEN_COOKIE = 'refreshToken'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookies = request.cookies
  const accessToken = cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE)?.value

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If user is on login page and already authenticated, redirect to home
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Only when we have a refreshToken but no accessToken
  if (!accessToken && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/RefreshToken`, {
        method: 'POST',
        headers: {
          'X-ApiSecretKey': API_SECRET_KEY,
          // forward only the refreshToken cookie
          'Cookie': `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
        },
      })

      if (refreshRes.ok) {
        // Pull out all Set-Cookie headers
        const setCookieHeaders: string[] =
          refreshRes.headers.getSetCookie?.() ??
          (refreshRes.headers.get('set-cookie')?.split(/,(?=[^ ;]+=)/) || [])

        // Extract the new accessToken value
        let newAccessTokenValue: string | undefined
        for (const header of setCookieHeaders) {
          if (header.startsWith(`${ACCESS_TOKEN_COOKIE}=`)) {
            const [pair] = header.split('; ')
            newAccessTokenValue = pair.split('=')[1]
            break
          }
        }

        if (newAccessTokenValue) {
          const originalCookies = request.headers.get('cookie') || ''
          const filtered = originalCookies
            .split('; ')
            .filter((c) => !c.startsWith(`${ACCESS_TOKEN_COOKIE}=`) && c)
          filtered.push(`${ACCESS_TOKEN_COOKIE}=${newAccessTokenValue}`)
          const newCookieHeader = filtered.join('; ')

          // Clone request headers and override the Cookie header
          const newHeaders = new Headers(request.headers)
          newHeaders.set('cookie', newCookieHeader)

          // Prepare the middleware response:
          const response = NextResponse.next({
            request: {
              headers: newHeaders,
            },
          })

          // Also re-apply all Set-Cookie headers so the browser stores them
          for (const header of setCookieHeaders) {
            response.headers.append('set-cookie', header)
          }

          return response
        }
      }
    } catch (error) {
      console.error('Error during token refresh:', error)
    }
  }

  //Check if user is authenticated for protected routes
  if (!isPublicRoute && !accessToken && !refreshToken) {
    // User is not authenticated and trying to access a protected route
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico).*)',
  ],
}
