'use client'

import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Input,
  Modal,
  Button,
  Group,
  Stack,
} from '@mantine/core'
import { useState } from 'react'
import TransactionsTable from '../../components/TransactionsTable'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { doGet } from '@/helpers/apiClient'
import { useQuery } from '@tanstack/react-query'
import { GetTransactionsForCurrentMonthDto } from '@/interfaces/api/transactions/GetTransactionsForCurrentMonthDto'
import { GetAllPotDataDto, SavingsPotData } from '@/interfaces/api/pots/GetAllPotDataDto'
import { SpendingPotCard } from '../cards/SpendingPotCard'
import { SavingsPotCard } from '../cards/SavingsPotCard'

export default function ThisMonthComponent() {
  const { data: potOptions, isLoading: isLoadingPotOptions } = useQuery({
    queryKey: ['getSpendingPotDropdownOptions'],
    queryFn: () => doGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  const { data: allPotData, isLoading: isLoadingAllPotData } = useQuery({
    queryKey: ['potBreakdownData'],
    queryFn: () => doGet<GetAllPotDataDto>('/api/pots/GetAllPotData')
  })

  const { data: thisMonthTransactionsData, isLoading: isLoadingThisMonthTransactionsData } = useQuery({
    queryKey: ['thisMonthTransactions'],
    queryFn: () => doGet<GetTransactionsForCurrentMonthDto>('/api/transactions/GetTransactionsForMonth')
  })

  const [openEditSavingsModal, setOpenEditSavingsModal] = useState(false)
  const [currentEditedSavingsPot] = useState<SavingsPotData | undefined>(undefined)
  const [editAmount, setEditAmount] = useState('')

  const handleSaveSavings = () => {
    console.log(`Updating ${currentEditedSavingsPot?.potName} to £${editAmount}`)
    setOpenEditSavingsModal(false)
  }

  const StatsPlaceholder = ({ title }: { title: string }) => (
    <Paper withBorder p="md" radius="md" shadow="sm" h={200}>
      <Stack align="center" justify="center" h="100%">
        <Text fw={600} size="lg">{title}</Text>
        <Text size="sm" c="dimmed">Chart/Graph will go here</Text>
      </Stack>
    </Paper>
  )

  if (isLoadingPotOptions || isLoadingAllPotData || isLoadingThisMonthTransactionsData) {
    return <div>Loading...</div>
  }

  if (potOptions?.data === undefined || allPotData?.data === undefined || thisMonthTransactionsData?.data === undefined) {
    return <div>Error loading data</div>
  }

  return (
    <Container size="xl">
      {/* Page Title */}
      <Title order={1} mb="xl" ta="center">
        This Month
      </Title>

      {/* Regular Pots Section */}
      <Title order={2} mb="lg" ta="center">
        Monthly Budget Breakdown
      </Title>
      <Grid gutter="md" mb="xl">
        {allPotData.data.spendingPots.map((pot) => (
          <Grid.Col span={{ base: 12, sm: 6, md: allPotData.data !== undefined && allPotData.data.spendingPots.length > 3 ? 3 : 4 }} key={pot.potId}>
            <SpendingPotCard data={pot} />
          </Grid.Col>
        ))}
      </Grid>

      {/* Savings Section */}
      <Title order={2} mb="lg" ta="center">
        Savings Breakdown
      </Title>
      <Grid gutter="lg" justify="center" mb="xl">
        {allPotData.data.savingsPots.map((pot) => (
          <Grid.Col span={{ base: 12, sm: 6, md: allPotData.data !== undefined && allPotData.data.savingsPots.length > 3 ? 3 : 4 }} key={pot.potId}>
            <SavingsPotCard data={pot} />
          </Grid.Col>
        ))}
      </Grid>

      {/* Transactions Section */}
      <Title order={2} mb="lg" ta="center">
        Transactions This Month
      </Title>
      <TransactionsTable
        transactions={thisMonthTransactionsData.data.transactions}
        potOptions={potOptions.data.potOptions}
      />

      {/* Savings Tracking Over Time */}
      <Title order={2} mb="lg" mt="lg" ta="center">
        Savings Progress Over Time
      </Title>
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <StatsPlaceholder title="Emergency Fund - 12 Month Trend" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <StatsPlaceholder title="Holiday Fund - 12 Month Trend" />
        </Grid.Col>
        <Grid.Col span={12}>
          <StatsPlaceholder title="All Savings Pots - Monthly Comparison" />
        </Grid.Col>
      </Grid>

      {/* Stats Breakdown */}
      <Title order={2} mt="xl" mb="lg" ta="center">
        Stats Breakdown
      </Title>
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatsPlaceholder title="Spent Per Pot" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatsPlaceholder title="Top Places Money Spent" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatsPlaceholder title="Most Expensive Purchases" />
        </Grid.Col>
      </Grid>

      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatsPlaceholder title="Weekly Spending Trend" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatsPlaceholder title="Category Comparison" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <StatsPlaceholder title="Budget vs Actual" />
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="md" shadow="sm" h={250} mb="xl">
        <Stack align="center" justify="center" h="100%">
          <Text fw={600} size="xl">Daily Money Spent</Text>
          <Text size="sm" c="dimmed">Daily spending chart will go here</Text>
        </Stack>
      </Paper>

      {/* Edit Savings Modal */}
      <Modal
        opened={openEditSavingsModal}
        onClose={() => setOpenEditSavingsModal(false)}
        title={`Editing ${currentEditedSavingsPot?.potName}`}
        size="xs"
        centered
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Savings Amount
            </Text>
            <Input
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Group justify="center">
            <Button color="green" onClick={handleSaveSavings}>
              Save
            </Button>
            <Button color="red" variant="outline" onClick={() => setOpenEditSavingsModal(false)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
