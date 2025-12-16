'use client'

import {
  Container,
  Grid,
  Title,
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Loader,
  Center,
  Alert
} from '@mantine/core'
import TransactionsTable from '@/components/TransactionsTable'
import StatCard from '@/components/cards/StatCard'
import { doQueryGet } from '@/helpers/apiClient'
import { useQuery } from '@tanstack/react-query'
import { GetHomepageStatsDto } from '@/interfaces/api/stats/GetHomepageStatsDto'
import { GetUnprocessedTransactionsDto } from '@/interfaces/api/transactions/GetUnprocessedTransactionsDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { IconAlertCircle, IconReceipt } from '@tabler/icons-react'

export default function HomeComponent() {
  const { data: statsData, isLoading: isLoadingStatsData } = useQuery({
    queryKey: ['homepage-stats'],
    queryFn: async () => await doQueryGet<GetHomepageStatsDto>('/api/stats/GetHomepageStats')
  })

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['unprocessedTransactions'],
    queryFn: async () => await doQueryGet<GetUnprocessedTransactionsDto>('/api/transactions/GetUnprocessedTransactions')
  })

  const { data: potOptions, isLoading: isLoadingPotOptions } = useQuery({
    queryKey: ['getSpendingPotDropdownOptions'],
    queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  if (isLoadingStatsData || isLoadingTransactions || isLoadingPotOptions) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading your financial data...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (statsData === undefined || transactions === undefined || potOptions === undefined) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          mt="xl"
        >
          Failed to load financial data. Please try refreshing the page.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <div>
          <Title order={1} mb="xs">
            Finance Overview
          </Title>
          <Text c="dimmed" size="sm">
            Track your income, expenses, and manage transactions
          </Text>
        </div>

        {/* Financial Stats Grid */}
        <div>
          <Title order={2} size="h3" mb="md" ta="center">
            Current Month Summary
          </Title>
          <Grid gutter="md" justify="center">
            <Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 2.4 }}>
              <StatCard title="Money In" amount={statsData.moneyIn} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 2.4 }}>
              <StatCard title="Money Spent" amount={statsData.moneySpent} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 2.4 }}>
              <StatCard title="Total Saved" amount={statsData.totalInSavings} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, sm: 6, md: 2.4 }}>
              <StatCard title="Money Left" amount={statsData.moneyLeft} />
            </Grid.Col>

          </Grid>
        </div>

        {/* Transactions Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <IconReceipt size="1.5rem" />
                <Title order={2} size="h3">
                  Transactions To Process
                </Title>
              </Group>
              <Badge
                size="lg"
                variant="light"
                color={transactions.unprocessedTransactions.length > 0 ? 'orange' : 'green'}
              >
                {transactions.unprocessedTransactions.length} pending
              </Badge>
            </Group>

            {transactions.unprocessedTransactions.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <Text size="lg" fw={500} c="dimmed">
                    🎉 All caught up!
                  </Text>
                  <Text size="sm" c="dimmed">
                    No transactions need processing at the moment
                  </Text>
                </Stack>
              </Center>
            ) : (
              <TransactionsTable
                transactions={transactions.unprocessedTransactions}
                potOptions={potOptions.potOptions}
              />
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
