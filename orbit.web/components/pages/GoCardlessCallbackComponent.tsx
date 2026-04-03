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
  IconBuildingBank
} from '@tabler/icons-react'

export default function GoCardlessCallbackComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      const ref = searchParams.get('ref')
      const error = searchParams.get('error')

      if (error !== null) {
        setStatus('error')
        setErrorMessage(error)
        return
      }

      // Get the stored requisition ID
      const requisitionId = typeof window !== 'undefined'
        ? window.sessionStorage.getItem('gocardless_requisition_id')
        : null

      // Use ref param if available (GoCardless passes it back), otherwise use stored requisition ID
      const finalRequisitionId = ref ?? requisitionId

      if (finalRequisitionId === null) {
        setStatus('error')
        setErrorMessage('Bank connection reference not found. Please try connecting again.')
        return
      }

      const result = await doPost('/api/gocardless/CompleteConnection', {
        body: { requisitionId: finalRequisitionId }
      })

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('gocardless_requisition_id')
      }

      if (result.ok) {
        setStatus('success')
        notificationHelper.showSuccessNotification(
          'Bank Connected',
          'Your bank account has been successfully connected.',
          5000,
          <IconCheck />
        )
        setTimeout(() => {
          router.push('/settings')
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(result.statusMessage ?? 'Failed to complete bank connection. The bank may not have authorised access.')
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
              <Title order={3}>Connecting to Your Bank...</Title>
              <Text c="dimmed">Please wait while we complete the connection.</Text>
            </>
          )}

          {status === 'success' && (
            <>
              <ThemeIcon size={80} radius="xl" variant="light" color="green">
                <IconCheck size={40} />
              </ThemeIcon>
              <Title order={3}>Bank Connected!</Title>
              <Text c="dimmed">
                Your bank account has been successfully connected. You will be redirected to settings shortly.
              </Text>
              <Text size="sm" c="dimmed">
                Transactions will begin syncing automatically within the hour.
              </Text>
            </>
          )}

          {status === 'error' && (
            <>
              <ThemeIcon size={80} radius="xl" variant="light" color="red">
                <IconX size={40} />
              </ThemeIcon>
              <Title order={3}>Connection Failed</Title>
              <Text c="dimmed" ta="center">
                {errorMessage}
              </Text>
              <Button
                leftSection={<IconBuildingBank size={18} />}
                onClick={() => router.push('/settings')}
              >
                Go to Settings
              </Button>
            </>
          )}
        </Stack>
      </Center>
    </Container>
  )
}
