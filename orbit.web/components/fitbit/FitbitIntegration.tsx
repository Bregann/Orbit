'use client'

import { doQueryGet, doPost } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { QueryKeys } from '@/helpers/QueryKeys'
import {
  FitbitAuthUrlResponse,
  FitbitConnectionStatus,
  FitbitProfile,
  FitbitActivitySummary
} from '@/interfaces/api/fitbit/FitbitTypes'
import {
  Card,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Avatar,
  Grid,
  Paper,
  RingProgress,
  Center,
  Loader
} from '@mantine/core'
import {
  IconCheck,
  IconX,
  IconActivity,
  IconWalk,
  IconFlame,
  IconClock,
  IconLink,
  IconLinkOff
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

const STEPS_GOAL = 10000 // Default daily steps goal

export default function FitbitIntegration() {
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // Get connection status
  const { data: connectionStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: [QueryKeys.FitbitConnectionStatus],
    queryFn: async () => await doQueryGet<FitbitConnectionStatus>('/api/fitbit/GetConnectionStatus')
  })

  // Get profile if connected
  const { data: profile } = useQuery({
    queryKey: [QueryKeys.FitbitProfile],
    queryFn: async () => await doQueryGet<FitbitProfile>('/api/fitbit/GetProfile'),
    enabled: connectionStatus?.isConnected === true
  })

  // Get today's activity if connected
  const { data: activity } = useQuery({
    queryKey: [QueryKeys.FitbitDailyActivity],
    queryFn: async () => await doQueryGet<FitbitActivitySummary>('/api/fitbit/GetDailyActivity'),
    enabled: connectionStatus?.isConnected === true
  })

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code !== null) {
      handleOAuthCallback(code)
    }
  }, [])

  const handleOAuthCallback = async (code: string) => {
    setIsConnecting(true)

    // Get stored code verifier from sessionStorage
    const storedVerifier = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('fitbit_code_verifier')
      : null

    if (storedVerifier === null) {
      notificationHelper.showErrorNotification(
        'Connection Failed',
        'Code verifier not found. Please try connecting again.',
        5000,
        <IconX />
      )

      setIsConnecting(false)

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
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

    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname)

    if (result.ok) {
      notificationHelper.showSuccessNotification(
        'Fitbit Connected',
        'Your Fitbit account has been successfully connected.',
        5000,
        <IconCheck />
      )

      queryClient.invalidateQueries({ queryKey: [QueryKeys.FitbitConnectionStatus] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.FitbitProfile] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.FitbitDailyActivity] })
    } else {
      notificationHelper.showErrorNotification(
        'Connection Failed',
        'Failed to connect Fitbit. Please try again.',
        5000,
        <IconX />
      )
    }

    setIsConnecting(false)
  }

  const handleConnect = async () => {
    setIsConnecting(true)

    const result = await doQueryGet<FitbitAuthUrlResponse>('/api/fitbit/GetAuthorizationUrl')

    if (result !== undefined && result.authorizationUrl !== undefined && result.codeVerifier !== undefined) {
      // Store the code verifier in sessionStorage for the callback
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('fitbit_code_verifier', result.codeVerifier)
      }

      // Redirect to Fitbit authorization
      window.location.href = result.authorizationUrl
    } else {
      notificationHelper.showErrorNotification(
        'Connection Failed',
        'Failed to generate authorization URL. Please try again.',
        5000,
        <IconX />
      )

      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)

    const result = await doPost('/api/fitbit/Disconnect', {})

    if (result.ok) {
      notificationHelper.showSuccessNotification(
        'Fitbit Disconnected',
        'Your Fitbit account has been disconnected.',
        5000,
        <IconCheck />
      )

      queryClient.invalidateQueries({ queryKey: [QueryKeys.FitbitConnectionStatus] })
      queryClient.setQueryData([QueryKeys.FitbitProfile], null)
      queryClient.setQueryData([QueryKeys.FitbitDailyActivity], null)
    } else {
      notificationHelper.showErrorNotification(
        'Disconnect Failed',
        'Failed to disconnect Fitbit. Please try again.',
        5000,
        <IconX />
      )
    }

    setIsDisconnecting(false)
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

  const isConnected = connectionStatus?.isConnected === true
  const stepsProgress = activity?.summary?.steps !== undefined
    ? Math.min((activity.summary.steps / STEPS_GOAL) * 100, 100)
    : 0

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="cyan">
              <IconActivity size={24} />
            </ThemeIcon>
            <div>
              <Title order={3}>Fitbit Integration</Title>
              <Text size="sm" c="dimmed">
                Connect your Fitbit account to track your health data
              </Text>
            </div>
          </Group>
          <Badge
            color={isConnected ? 'green' : 'gray'}
            variant="light"
            size="lg"
          >
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </Group>

        {/* Connection Button or Profile */}
        {!isConnected ? (
          <Paper withBorder p="xl" radius="md" bg="gray.9">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                <IconLinkOff size={30} />
              </ThemeIcon>
              <Text ta="center" c="dimmed">
                Connect your Fitbit account to sync your steps, activity, and health data.
              </Text>
              <Button
                leftSection={<IconLink size={18} />}
                onClick={handleConnect}
                loading={isConnecting}
                size="md"
              >
                Connect Fitbit
              </Button>
            </Stack>
          </Paper>
        ) : (
          <>
            {/* Profile Section */}
            {profile?.user !== undefined && (
              <Paper withBorder p="md" radius="md">
                <Group>
                  <Avatar
                    src={profile.user.avatar}
                    size="lg"
                    radius="xl"
                  />
                  <div>
                    <Text fw={500}>{profile.user.displayName}</Text>
                    <Text size="sm" c="dimmed">
                      Member since {profile.user.memberSince}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Average daily steps: {profile.user.averageDailySteps.toLocaleString()}
                    </Text>
                  </div>
                </Group>
              </Paper>
            )}

            {/* Activity Summary */}
            {activity?.summary !== undefined && (
              <Grid>
                {/* Steps Ring */}
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper withBorder p="md" radius="md" h="100%">
                    <Stack align="center" gap="xs">
                      <RingProgress
                        size={100}
                        thickness={8}
                        roundCaps
                        sections={[{ value: stepsProgress, color: 'cyan' }]}
                        label={
                          <Center>
                            <IconWalk size={24} />
                          </Center>
                        }
                      />
                      <Text size="xl" fw={700}>
                        {activity.summary.steps.toLocaleString()}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Steps Today
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Calories */}
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper withBorder p="md" radius="md" h="100%">
                    <Stack align="center" gap="xs">
                      <ThemeIcon size={60} radius="xl" variant="light" color="orange">
                        <IconFlame size={30} />
                      </ThemeIcon>
                      <Text size="xl" fw={700}>
                        {activity.summary.caloriesOut.toLocaleString()}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Calories Burned
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Active Minutes */}
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper withBorder p="md" radius="md" h="100%">
                    <Stack align="center" gap="xs">
                      <ThemeIcon size={60} radius="xl" variant="light" color="green">
                        <IconClock size={30} />
                      </ThemeIcon>
                      <Text size="xl" fw={700}>
                        {activity.summary.veryActiveMinutes + activity.summary.fairlyActiveMinutes}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Active Minutes
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Floors */}
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper withBorder p="md" radius="md" h="100%">
                    <Stack align="center" gap="xs">
                      <ThemeIcon size={60} radius="xl" variant="light" color="violet">
                        <IconActivity size={30} />
                      </ThemeIcon>
                      <Text size="xl" fw={700}>
                        {activity.summary.floors}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Floors Climbed
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            )}

            {/* Disconnect Button */}
            <Group justify="flex-end">
              <Button
                variant="light"
                color="red"
                leftSection={<IconLinkOff size={18} />}
                onClick={handleDisconnect}
                loading={isDisconnecting}
              >
                Disconnect Fitbit
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Card>
  )
}
