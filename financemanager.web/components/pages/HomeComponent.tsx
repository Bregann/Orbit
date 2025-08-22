'use client'

import { Container, Grid, Title } from '@mantine/core'
import TransactionsTable from '@/components/TransactionsTable'
import StatCard from '@/components/cards/StatCard'
import { doQueryGet } from '@/helpers/apiClient'
import { useQuery } from '@tanstack/react-query'
import { GetHomepageStatsDto } from '@/interfaces/api/stats/GetHomepageStatsDto'
import { GetUnprocessedTransactionsDto } from '@/interfaces/api/transactions/GetUnprocessedTransactionsDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'

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
    return <div>Loading...</div>
  }

  if (statsData === undefined || transactions === undefined || potOptions === undefined) {
    return <div>Error loading data</div>
  }

  return (
    <Container size="lg">
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Money In" amount={statsData.moneyIn} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Money Spent" amount={statsData.moneySpent} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Money Left" amount={statsData.moneyLeft} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total in Savings" amount={statsData.totalInSavings} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total in Spending Pots" amount={statsData.totalInSpendingPots} />
        </Grid.Col>
      </Grid>

      <Title order={1} mb="lg">
        Transactions To Process
      </Title>
      {transactions.unprocessedTransactions.length === 0 ?
        <p>No transactions to process</p>
        :
        <TransactionsTable
          transactions={transactions.unprocessedTransactions}
          potOptions={potOptions.potOptions}
        />
      }
    </Container>
  )
}
