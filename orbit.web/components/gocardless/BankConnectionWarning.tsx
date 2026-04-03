'use client'

import { doQueryGet } from '@/helpers/apiClient'
import { QueryKeys } from '@/helpers/QueryKeys'
import type { GoCardlessConnectionStatus } from '@/interfaces/api/gocardless/GoCardlessTypes'
import { Alert, Button, Group, Text } from '@mantine/core'
import { IconAlertTriangle, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export default function BankConnectionWarning() {
  const router = useRouter()

  const { data: connectionStatus } = useQuery({
    queryKey: [QueryKeys.GoCardlessConnectionStatus],
    queryFn: async () => await doQueryGet<GoCardlessConnectionStatus>('/api/gocardless/GetConnectionStatus')
  })

  if (connectionStatus === undefined) return null

  const expiredConnections = connectionStatus.connections.filter(c => c.status === 'Expired')
  const expiringSoonConnections = connectionStatus.connections.filter(c => c.isExpiringSoon)
  const hasNoConnections = connectionStatus.connections.length === 0

  if (expiredConnections.length === 0 && expiringSoonConnections.length === 0 && !hasNoConnections) {
    return null
  }

  if (hasNoConnections) {
    return (
      <Alert
        icon={<IconAlertTriangle size={20} />}
        title="No bank accounts connected"
        color="blue"
        variant="light"
      >
        <Group justify="space-between" align="center">
          <Text size="sm">
            Connect your bank account to automatically sync transactions.
          </Text>
          <Button
            size="xs"
            variant="light"
            onClick={() => router.push('/settings')}
          >
            Connect Bank
          </Button>
        </Group>
      </Alert>
    )
  }

  if (expiredConnections.length > 0) {
    return (
      <Alert
        icon={<IconX size={20} />}
        title="Bank connection expired"
        color="red"
        variant="light"
      >
        <Group justify="space-between" align="center">
          <Text size="sm">
            Your connection to <strong>{expiredConnections[0].institutionName}</strong> has expired.
            Transactions are no longer being synced.
          </Text>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={() => router.push('/settings')}
          >
            Reconnect
          </Button>
        </Group>
      </Alert>
    )
  }

  if (expiringSoonConnections.length > 0) {
    const conn = expiringSoonConnections[0]
    return (
      <Alert
        icon={<IconAlertTriangle size={20} />}
        title="Bank connection expiring soon"
        color="yellow"
        variant="light"
      >
        <Group justify="space-between" align="center">
          <Text size="sm">
            Your connection to <strong>{conn.institutionName}</strong> expires in {conn.daysUntilExpiry} day(s).
            Reconnect to avoid interruption.
          </Text>
          <Button
            size="xs"
            variant="light"
            color="yellow"
            onClick={() => router.push('/settings')}
          >
            Reconnect
          </Button>
        </Group>
      </Alert>
    )
  }

  return null
}
