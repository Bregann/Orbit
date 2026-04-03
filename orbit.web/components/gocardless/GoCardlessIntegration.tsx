'use client'

import { doQueryGet, doPost } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { QueryKeys } from '@/helpers/QueryKeys'
import type {
  GoCardlessConnectionStatus,
  GoCardlessInstitution,
  GoCardlessInitiateConnectionResponse,
  GoCardlessBankConnection
} from '@/interfaces/api/gocardless/GoCardlessTypes'
import {
  Card,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Paper,
  Center,
  Loader,
  TextInput,
  Image,
  SimpleGrid,
  Progress,
  Alert,
  Tooltip,
  ActionIcon,
  Modal
} from '@mantine/core'
import {
  IconCheck,
  IconX,
  IconBuildingBank,
  IconLink,
  IconLinkOff,
  IconAlertTriangle,
  IconSearch,
  IconRefresh,
  IconClock,
  IconTrash
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useDisclosure } from '@mantine/hooks'

export default function GoCardlessIntegration() {
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBankSelector, setShowBankSelector] = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState<GoCardlessBankConnection | null>(null)
  const [disconnectModalOpened, { open: openDisconnectModal, close: closeDisconnectModal }] = useDisclosure(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // Get connection status
  const { data: connectionStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: [QueryKeys.GoCardlessConnectionStatus],
    queryFn: async () => await doQueryGet<GoCardlessConnectionStatus>('/api/gocardless/GetConnectionStatus')
  })

  // Get institutions when bank selector is shown
  const { data: institutions, isLoading: isLoadingInstitutions } = useQuery({
    queryKey: [QueryKeys.GoCardlessInstitutions],
    queryFn: async () => await doQueryGet<GoCardlessInstitution[]>('/api/gocardless/GetInstitutions?country=GB'),
    enabled: showBankSelector
  })

  // Filter institutions by search
  const filteredInstitutions = useMemo(() => {
    if (institutions === undefined) return []
    if (searchQuery.trim() === '') return institutions

    return institutions.filter(inst =>
      inst.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [institutions, searchQuery])

  const handleConnect = async (institutionId: string) => {
    setIsConnecting(true)

    try {
      const response = await doPost<GoCardlessInitiateConnectionResponse>(
        '/api/gocardless/InitiateConnection',
        { body: { institutionId } }
      )

      if (response.ok && response.data !== undefined) {
        // Store requisition ID for the callback
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('gocardless_requisition_id', response.data.requisitionId)
        }

        // Redirect to bank authorization page
        window.location.href = response.data.authorizationUrl
      } else {
        notificationHelper.showErrorNotification(
          'Connection Failed',
          response.statusMessage ?? 'Failed to initiate bank connection. Please try again.',
          5000,
          <IconX />
        )
        setIsConnecting(false)
      }
    } catch {
      notificationHelper.showErrorNotification(
        'Connection Failed',
        'An error occurred while connecting to your bank. Please try again.',
        5000,
        <IconX />
      )
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (disconnectTarget === null) return

    setIsDisconnecting(true)

    const result = await doPost(`/api/gocardless/Disconnect?connectionId=${disconnectTarget.id}`, {})

    if (result.ok) {
      notificationHelper.showSuccessNotification(
        'Bank Disconnected',
        `${disconnectTarget.institutionName} has been disconnected.`,
        5000,
        <IconCheck />
      )

      queryClient.invalidateQueries({ queryKey: [QueryKeys.GoCardlessConnectionStatus] })
    } else {
      notificationHelper.showErrorNotification(
        'Disconnect Failed',
        'Failed to disconnect bank. Please try again.',
        5000,
        <IconX />
      )
    }

    setIsDisconnecting(false)
    closeDisconnectModal()
    setDisconnectTarget(null)
  }

  const getStatusColor = (connection: GoCardlessBankConnection) => {
    if (connection.status === 'Expired') return 'red'
    if (connection.isExpiringSoon) return 'yellow'
    return 'green'
  }

  const getStatusLabel = (connection: GoCardlessBankConnection) => {
    if (connection.status === 'Expired') return 'Expired'
    if (connection.isExpiringSoon) return `Expires in ${connection.daysUntilExpiry} days`
    return `Active - ${connection.daysUntilExpiry} days left`
  }

  if (isLoadingStatus) {
    return (
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Center>
          <Loader size="lg" />
        </Center>
      </Card>
    )
  }

  const hasConnections = connectionStatus !== undefined && connectionStatus.connections.length > 0
  const activeConnections = connectionStatus?.connections.filter(c => c.status === 'Active') ?? []
  const expiredConnections = connectionStatus?.connections.filter(c => c.status === 'Expired') ?? []
  const expiringSoonConnections = connectionStatus?.connections.filter(c => c.isExpiringSoon) ?? []

  return (
    <>
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Group>
              <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                <IconBuildingBank size={24} />
              </ThemeIcon>
              <div>
                <Title order={3}>Bank Connections</Title>
                <Text size="sm" c="dimmed">
                  Connect your bank accounts via GoCardless Open Banking
                </Text>
              </div>
            </Group>
            <Badge
              color={connectionStatus?.hasActiveConnections === true ? 'green' : 'gray'}
              variant="light"
              size="lg"
            >
              {activeConnections.length > 0 ? `${activeConnections.length} Active` : 'No Connections'}
            </Badge>
          </Group>

          {/* Expiry Warnings */}
          {expiringSoonConnections.length > 0 && (
            <Alert
              icon={<IconAlertTriangle size={20} />}
              title="Bank connections expiring soon"
              color="yellow"
              variant="light"
            >
              <Stack gap="xs">
                {expiringSoonConnections.map(conn => (
                  <Group key={conn.id} justify="space-between">
                    <Text size="sm">
                      <strong>{conn.institutionName}</strong> expires in {conn.daysUntilExpiry} day(s).
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color="yellow"
                      leftSection={<IconRefresh size={14} />}
                      onClick={() => {
                        setShowBankSelector(true)
                      }}
                    >
                      Reconnect
                    </Button>
                  </Group>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Expired Connection Warnings */}
          {expiredConnections.length > 0 && (
            <Alert
              icon={<IconX size={20} />}
              title="Expired bank connections"
              color="red"
              variant="light"
            >
              <Stack gap="xs">
                {expiredConnections.map(conn => (
                  <Group key={conn.id} justify="space-between">
                    <Text size="sm">
                      <strong>{conn.institutionName}</strong> connection has expired. Transactions are no longer being synced.
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<IconRefresh size={14} />}
                      onClick={() => {
                        setShowBankSelector(true)
                      }}
                    >
                      Reconnect
                    </Button>
                  </Group>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Active Connections List */}
          {hasConnections && (
            <Stack gap="sm">
              <Title order={5}>Connected Accounts</Title>
              {connectionStatus?.connections.map(conn => (
                <Paper key={conn.id} withBorder p="md" radius="md">
                  <Group justify="space-between" align="center">
                    <Group>
                      <ThemeIcon
                        size="lg"
                        radius="md"
                        variant="light"
                        color={getStatusColor(conn)}
                      >
                        <IconBuildingBank size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={500}>{conn.institutionName}</Text>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Account: {conn.accountId.substring(0, 8)}...
                          </Text>
                          {conn.lastSuccessfulSync !== undefined && conn.lastSuccessfulSync !== null && (
                            <Text size="xs" c="dimmed">
                              · Last sync: {new Date(conn.lastSuccessfulSync).toLocaleDateString()}
                            </Text>
                          )}
                        </Group>
                        {conn.lastSyncError !== undefined && conn.lastSyncError !== null && (
                          <Text size="xs" c="red">
                            Sync error: {conn.lastSyncError}
                          </Text>
                        )}
                      </div>
                    </Group>

                    <Group gap="sm">
                      <Badge
                        color={getStatusColor(conn)}
                        variant="light"
                        size="sm"
                      >
                        {getStatusLabel(conn)}
                      </Badge>

                      {conn.status !== 'Expired' && (
                        <Tooltip label={`Access expires: ${new Date(conn.expiresAt).toLocaleDateString()}`}>
                          <div style={{ width: 60 }}>
                            <Progress
                              value={Math.max(0, (conn.daysUntilExpiry / 90) * 100)}
                              color={getStatusColor(conn)}
                              size="sm"
                              radius="xl"
                            />
                          </div>
                        </Tooltip>
                      )}

                      <Tooltip label="Disconnect this account">
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="md"
                          onClick={() => {
                            setDisconnectTarget(conn)
                            openDisconnectModal()
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}

          {/* No Connections State / Connect Button */}
          {!showBankSelector ? (
            <Paper withBorder p="xl" radius="md" bg="gray.9">
              <Stack align="center" gap="md">
                {!hasConnections && (
                  <>
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                      <IconLinkOff size={30} />
                    </ThemeIcon>
                    <Text ta="center" c="dimmed">
                      Connect your bank accounts to automatically sync your transactions.
                      Access must be renewed every 90 days.
                    </Text>
                  </>
                )}
                <Button
                  leftSection={<IconLink size={18} />}
                  onClick={() => setShowBankSelector(true)}
                  loading={isConnecting}
                  size="md"
                >
                  {hasConnections ? 'Connect Another Bank' : 'Connect Bank Account'}
                </Button>
              </Stack>
            </Paper>
          ) : (
            /* Bank Selector */
            <Paper withBorder p="lg" radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={5}>Select Your Bank</Title>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => {
                      setShowBankSelector(false)
                      setSearchQuery('')
                    }}
                  >
                    Cancel
                  </Button>
                </Group>

                <TextInput
                  placeholder="Search for your bank..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />

                {isLoadingInstitutions ? (
                  <Center py="xl">
                    <Loader size="md" />
                  </Center>
                ) : (
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                    {filteredInstitutions.slice(0, 40).map(inst => (
                      <Paper
                        key={inst.id}
                        withBorder
                        p="sm"
                        radius="md"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleConnect(inst.id)}
                      >
                        <Stack align="center" gap="xs">
                          {inst.logo !== '' ? (
                            <Image
                              src={inst.logo}
                              alt={inst.name}
                              w={40}
                              h={40}
                              fit="contain"
                            />
                          ) : (
                            <ThemeIcon size={40} radius="md" variant="light" color="blue">
                              <IconBuildingBank size={20} />
                            </ThemeIcon>
                          )}
                          <Text size="xs" ta="center" lineClamp={2}>
                            {inst.name}
                          </Text>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                )}

                {!isLoadingInstitutions && filteredInstitutions.length === 0 && (
                  <Text ta="center" c="dimmed" py="md">
                    No banks found matching &quot;{searchQuery}&quot;
                  </Text>
                )}
              </Stack>
            </Paper>
          )}

          {/* Info section */}
          <Paper withBorder p="sm" radius="md" bg="gray.9">
            <Group gap="xs" align="flex-start">
              <IconClock size={16} style={{ marginTop: 2, flexShrink: 0 }} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                Bank connections use Open Banking and must be re-authorised every 90 days for security.
                You&apos;ll receive notifications when your connections are about to expire.
              </Text>
            </Group>
          </Paper>
        </Stack>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Modal
        opened={disconnectModalOpened}
        onClose={closeDisconnectModal}
        title="Disconnect Bank Account"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to disconnect <strong>{disconnectTarget?.institutionName}</strong>?
            Transactions will no longer be synced from this account.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDisconnectModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDisconnect}
              loading={isDisconnecting}
            >
              Disconnect
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
