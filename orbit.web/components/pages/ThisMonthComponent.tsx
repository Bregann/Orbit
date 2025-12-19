'use client'

import {
  Container,
  Text,
  Title,
  Stack,
  Divider,
  Loader,
  Center,
  Alert
} from '@mantine/core'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { doQueryGet } from '@/helpers/apiClient'
import { useQuery } from '@tanstack/react-query'
import { GetTransactionsForCurrentMonthDto } from '@/interfaces/api/transactions/GetTransactionsForCurrentMonthDto'
import { GetAllPotDataDto } from '@/interfaces/api/pots/GetAllPotDataDto'
import { GetSubscriptionsDto } from '@/interfaces/api/subscriptions/GetSubscriptionsDto'
import { IconAlertCircle } from '@tabler/icons-react'
import ThisMonthBudgetSection from '@/components/finance/this-month/ThisMonthBudgetSection'
import ThisMonthSavingsSection from '@/components/finance/this-month/ThisMonthSavingsSection'
import ThisMonthSubscriptionsSection from '@/components/finance/this-month/ThisMonthSubscriptionsSection'
import ThisMonthTransactionsSection from '@/components/finance/this-month/ThisMonthTransactionsSection'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function ThisMonthComponent() {
  const { data: potOptions, isLoading: isLoadingPotOptions } = useQuery({
    queryKey: [QueryKeys.GetSpendingPotDropdownOptions],
    queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  const { data: allPotData, isLoading: isLoadingAllPotData } = useQuery({
    queryKey: [QueryKeys.PotBreakdownData],
    queryFn: async () => await doQueryGet<GetAllPotDataDto>('/api/pots/GetAllPotData')
  })

  const { data: thisMonthTransactionsData, isLoading: isLoadingThisMonthTransactionsData } = useQuery({
    queryKey: [QueryKeys.ThisMonthTransactions],
    queryFn: async () => await doQueryGet<GetTransactionsForCurrentMonthDto>('/api/transactions/GetTransactionsForMonth')
  })

  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: [QueryKeys.GetSubscriptions],
    queryFn: async () => await doQueryGet<GetSubscriptionsDto>('/api/subscriptions/GetSubscriptions')
  })

  if (isLoadingPotOptions || isLoadingAllPotData || isLoadingThisMonthTransactionsData || isLoadingSubscriptions) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading monthly data...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (potOptions === undefined || allPotData === undefined || thisMonthTransactionsData === undefined || subscriptionsData === undefined) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          mt="xl"
        >
          Failed to load monthly data. Please try refreshing the page.
        </Alert>
      </Container>
    )
  }

  if (isLoadingPotOptions || isLoadingAllPotData || isLoadingThisMonthTransactionsData || isLoadingSubscriptions) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading monthly data...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (potOptions === undefined || allPotData === undefined || thisMonthTransactionsData === undefined || subscriptionsData === undefined) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          mt="xl"
        >
          Failed to load monthly data. Please try refreshing the page.
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
            This Month
          </Title>
          <Text c="dimmed" size="sm">
            {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} - Detailed breakdown and analytics
          </Text>
        </div>

        {/* Monthly Budget Section */}
        <ThisMonthBudgetSection spendingPots={allPotData.spendingPots} />

        <Divider />

        {/* Savings Section */}
        <ThisMonthSavingsSection savingsPots={allPotData.savingsPots} />

        <Divider />

        {/* Monthly Payments / Subscriptions Section */}
        <ThisMonthSubscriptionsSection subscriptions={subscriptionsData.subscriptions} />

        <Divider />

        {/* Transactions Section */}
        <ThisMonthTransactionsSection
          transactions={thisMonthTransactionsData.transactions}
          potOptions={potOptions.potOptions}
        />
      </Stack>
    </Container>
  )
}
