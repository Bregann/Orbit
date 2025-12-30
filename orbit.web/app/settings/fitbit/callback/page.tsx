'use client'

import { doPost } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Container,
  Center,
  Stack,
  Loader,
  Text,
  Title,
  ThemeIcon,
  Button
} from '@mantine/core'
import {
  IconCheck,
  IconX,
  IconActivity
} from '@tabler/icons-react'

export default function FitbitCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error !== null) {
        setStatus('error')
        setErrorMessage(errorDescription ?? error)
        return
      }

      if (code === null) {
        setStatus('error')
        setErrorMessage('No authorization code received')
        return
      }

      // Get stored code verifier from sessionStorage
      const storedVerifier = typeof window !== 'undefined'
        ? window.sessionStorage.getItem('fitbit_code_verifier')
        : null

      if (storedVerifier === null) {
        setStatus('error')
        setErrorMessage('Code verifier not found. Please try connecting again.')
        return
      }

      const result = await doPost('/api/fitbit/ExchangeCode', {
        body: {
          code: code,
          codeVerifier: storedVerifier
        }
      })

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('fitbit_code_verifier')
      }

      if (result.ok) {
        setStatus('success')
        notificationHelper.showSuccessNotification(
          'Fitbit Connected',
          'Your Fitbit account has been successfully connected.',
          5000,
          <IconCheck />
        )
        // Redirect to settings page after a short delay
        setTimeout(() => {
          router.push('/settings')
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage('Failed to exchange authorization code')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <Container size="sm" py="xl">
      <Center style={{ minHeight: '50vh' }}>
        <Stack align="center" gap="lg">
          {status === 'loading' && (
            <>
              <Loader size="xl" />
              <Title order={3}>Connecting to Fitbit...</Title>
              <Text c="dimmed">Please wait while we complete the authorization.</Text>
            </>
          )}

          {status === 'success' && (
            <>
              <ThemeIcon size={80} radius="xl" color="green">
                <IconCheck size={40} />
              </ThemeIcon>
              <Title order={3}>Successfully Connected!</Title>
              <Text c="dimmed">Your Fitbit account is now linked. Redirecting...</Text>
            </>
          )}

          {status === 'error' && (
            <>
              <ThemeIcon size={80} radius="xl" color="red">
                <IconX size={40} />
              </ThemeIcon>
              <Title order={3}>Connection Failed</Title>
              <Text c="dimmed" ta="center">{errorMessage}</Text>
              <Button
                leftSection={<IconActivity size={18} />}
                onClick={() => router.push('/settings')}
              >
                Back to Settings
              </Button>
            </>
          )}
        </Stack>
      </Center>
    </Container>
  )
}
