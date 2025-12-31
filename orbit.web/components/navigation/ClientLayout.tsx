'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  // Don't show navigation on login and other auth pages
  const noNavigationPages = ['/login', '/register', '/forgot-password', '/fitbit-success']
  const showNavigation = !noNavigationPages.includes(pathname)

  if (!showNavigation) {
    return <>{children}</>
  }

  return (
    <Navigation>
      {children}
    </Navigation>
  )
}
