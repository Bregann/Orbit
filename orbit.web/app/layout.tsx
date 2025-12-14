import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import Providers from './providers'
import { AuthProvider } from '@/context/authContext'
import ClientLayout from '@/components/navigation/ClientLayout'
import NextTopLoader from 'nextjs-toploader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Orbit',
    template: '%s | Orbit'
  },
  description: 'Your personal life companion'
}

//override the background colour for mantine dark mode
const theme = createTheme({
  colors: {
    dark: [
      '#F3F4F6',
      '#DFE2E6',
      '#C3C7CD',
      '#9BA1A9',
      '#6E757E',
      '#4A4F57',
      '#2F333B',
      '#23272E',
      '#1D2026',
      '#15171C'
    ]
  }
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextTopLoader color="#339af0" showSpinner={false} />
        <Providers>
          <AuthProvider>
            <MantineProvider defaultColorScheme="auto" theme={theme}>
              <Notifications />
              <ClientLayout>
                {children}
              </ClientLayout>
            </MantineProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
