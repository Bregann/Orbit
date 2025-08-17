'use client'

import { Container, Grid, Title } from '@mantine/core'
import TransactionsTable from '@/components/TransactionsTable'
import StatCard from '@/components/StatCard'
import { doGet, doPost } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { GetHomepageStatsDto } from '@/interfaces/api/stats/GetHomepageStatsDto'
import { GetUnprocessedTransactionsDto } from '@/interfaces/api/transactions/GetUnprocessedTransactionsDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'

export default function HomeComponent() {
  const { data: pageData, isLoading: isLoadingPageData } = useQuery({
    queryKey: ['homepage-stats'],
    queryFn: () => doGet<GetHomepageStatsDto>('/api/stats/GetHomepageStats')
  })

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['unprocessedTransactions'],
    queryFn: () => doGet<GetUnprocessedTransactionsDto>('/api/transactions/GetUnprocessedTransactions')
  })

  const { data: potOptions, isLoading: isLoadingPotOptions } = useQuery({
    queryKey: ['getSpendingPotDropdownOptions'],
    queryFn: () => doGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  const handlePotChange = async (transactionId: string, potId: string | null) => {
    const res = await doPost('/api/Transactions/UpdateTransaction', { body: {
      transactionId,
      potId
    }
    })

    if (res.ok) {
      if (potId === null) {
        setTransactions(transactions.filter(tx => tx.id !== transactionId))
      } else {
        setTransactions(transactions.map(tx => tx.id === transactionId ? { ...tx, potId: Number(potId) } : tx))
      }

      notificationHelper.showSuccessNotification('Success', 'Transaction updated successfully', 3000, <IconCheck />)
    } else {
      notificationHelper.showErrorNotification('Error', 'Failed to update transaction', 3000, <IconX />)
    }
  }

  if (isLoadingPageData || isLoadingTransactions || isLoadingPotOptions) {
    return <div>Loading...</div>
  }

  if (pageData === undefined || transactions === undefined || potOptions === undefined) {
    return <div>Error loading data</div>
  }

  return (
    <Container size="lg">
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Money In" amount={pageData.data?.moneyIn} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Money Spent" amount={pageData.moneySpent} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Money Left" amount={pageData.moneyLeft} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total in Savings" amount={pageData.totalInSavings} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
          <StatCard title="Total in Spending Pots" amount={pageData.totalInSpendingPots} />
        </Grid.Col>
      </Grid>

      <Title order={1} mb="lg">
        Transactions To Process
      </Title>
      {pageData.transactionsToProcess.length === 0 ?
        <p>No transactions to process</p>
        :
        <TransactionsTable
          transactions={transactions}
          potOptions={pageData.spendingPots}
          onPotChange={handlePotChange}
        />
      }
    </Container>
  )
}
