'use client'

import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Input,
  Modal,
  Button,
  Group,
  Stack,
  Badge,
  Divider,
  Loader,
  Center,
  Alert,
  ThemeIcon
} from '@mantine/core'
import { useState } from 'react'
import TransactionsTable from '../../components/TransactionsTable'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { doQueryGet } from '@/helpers/apiClient'
import { useQuery } from '@tanstack/react-query'
import { GetTransactionsForCurrentMonthDto } from '@/interfaces/api/transactions/GetTransactionsForCurrentMonthDto'
import { GetAllPotDataDto, SavingsPotData } from '@/interfaces/api/pots/GetAllPotDataDto'
import { SpendingPotCard } from '../cards/SpendingPotCard'
import { SavingsPotCard } from '../cards/SavingsPotCard'
import {
  IconAlertCircle,
  IconWallet,
  IconPigMoney,
  IconReceipt,
  IconChartBar,
  IconTrendingUp
} from '@tabler/icons-react'

export default function ThisMonthComponent() {
  const { data: potOptions, isLoading: isLoadingPotOptions } = useQuery({
    queryKey: ['getSpendingPotDropdownOptions'],
    queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  const { data: allPotData, isLoading: isLoadingAllPotData } = useQuery({
    queryKey: ['potBreakdownData'],
    queryFn: async () => await doQueryGet<GetAllPotDataDto>('/api/pots/GetAllPotData')
  })

  const { data: thisMonthTransactionsData, isLoading: isLoadingThisMonthTransactionsData } = useQuery({
    queryKey: ['thisMonthTransactions'],
    queryFn: async () => await doQueryGet<GetTransactionsForCurrentMonthDto>('/api/transactions/GetTransactionsForMonth')
  })

  const [openEditSavingsModal, setOpenEditSavingsModal] = useState(false)
  const [currentEditedSavingsPot] = useState<SavingsPotData | undefined>(undefined)
  const [editAmount, setEditAmount] = useState('')

  const handleSaveSavings = () => {
    console.log(`Updating ${currentEditedSavingsPot?.potName} to £${editAmount}`)
    setOpenEditSavingsModal(false)
  }

  const StatsPlaceholder = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <Card withBorder p="lg" radius="md" shadow="sm" h={220}>
      <Stack align="center" justify="center" h="100%" gap="md">
        {icon && (
          <ThemeIcon size="xl" radius="md" variant="light" color="blue">
            {icon}
          </ThemeIcon>
        )}
        <Text fw={600} size="lg" ta="center">{title}</Text>
        <Text size="sm" c="dimmed" ta="center">Chart visualization coming soon</Text>
      </Stack>
    </Card>
  )

  if (isLoadingPotOptions || isLoadingAllPotData || isLoadingThisMonthTransactionsData) {
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

  if (potOptions === undefined || allPotData === undefined || thisMonthTransactionsData === undefined) {
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
        <div>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconWallet size="1.2rem" />
              </ThemeIcon>
              <Title order={2} size="h3">
                Monthly Budget Breakdown
              </Title>
            </Group>
            <Badge size="lg" variant="light" color="blue">
              {allPotData.spendingPots.length} pots
            </Badge>
          </Group>
          <Grid gutter="md">
            {allPotData.spendingPots.map((pot) => (
              <Grid.Col span={{ base: 12, sm: 6, md: allPotData.spendingPots.length > 3 ? 3 : 4 }} key={pot.potId}>
                <SpendingPotCard data={pot} />
              </Grid.Col>
            ))}
          </Grid>
        </div>

        <Divider />

        {/* Savings Section */}
        <div>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                <IconPigMoney size="1.2rem" />
              </ThemeIcon>
              <Title order={2} size="h3">
                Savings Breakdown
              </Title>
            </Group>
            <Badge size="lg" variant="light" color="violet">
              {allPotData.savingsPots.length} pots
            </Badge>
          </Group>
          <Grid gutter="md">
            {allPotData.savingsPots.map((pot) => (
              <Grid.Col span={{ base: 12, sm: 6, md: allPotData.savingsPots.length > 3 ? 3 : 4 }} key={pot.potId}>
                <SavingsPotCard data={pot} />
              </Grid.Col>
            ))}
          </Grid>
        </div>

        <Divider />

        {/* Transactions Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconReceipt size="1.2rem" />
                </ThemeIcon>
                <Title order={2} size="h3">
                  Transactions This Month
                </Title>
              </Group>
              <Badge size="lg" variant="light" color="orange">
                {thisMonthTransactionsData.transactions.length} transactions
              </Badge>
            </Group>
            <Divider />
            {thisMonthTransactionsData.transactions.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <Text size="lg" fw={500} c="dimmed">
                    No transactions yet
                  </Text>
                  <Text size="sm" c="dimmed">
                    Transactions will appear here once you start spending
                  </Text>
                </Stack>
              </Center>
            ) : (
              <TransactionsTable
                transactions={thisMonthTransactionsData.transactions}
                potOptions={potOptions.potOptions}
              />
            )}
          </Stack>
        </Card>

        <Divider />

        {/* Savings Progress Over Time */}
        <div>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                <IconTrendingUp size="1.2rem" />
              </ThemeIcon>
              <Title order={2} size="h3">
                Savings Progress Over Time
              </Title>
            </Group>
          </Group>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <StatsPlaceholder title="Emergency Fund - 12 Month Trend" icon={<IconTrendingUp size="1.5rem" />} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <StatsPlaceholder title="Holiday Fund - 12 Month Trend" icon={<IconTrendingUp size="1.5rem" />} />
            </Grid.Col>
            <Grid.Col span={12}>
              <StatsPlaceholder title="All Savings Pots - Monthly Comparison" icon={<IconChartBar size="1.5rem" />} />
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Stats Breakdown */}
        <div>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                <IconChartBar size="1.2rem" />
              </ThemeIcon>
              <Title order={2} size="h3">
                Analytics & Insights
              </Title>
            </Group>
          </Group>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <StatsPlaceholder title="Spent Per Pot" icon={<IconChartBar size="1.5rem" />} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <StatsPlaceholder title="Top Places Money Spent" icon={<IconChartBar size="1.5rem" />} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <StatsPlaceholder title="Most Expensive Purchases" icon={<IconChartBar size="1.5rem" />} />
            </Grid.Col>
          </Grid>
        </div>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatsPlaceholder title="Weekly Spending Trend" icon={<IconTrendingUp size="1.5rem" />} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatsPlaceholder title="Category Comparison" icon={<IconChartBar size="1.5rem" />} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatsPlaceholder title="Budget vs Actual" icon={<IconChartBar size="1.5rem" />} />
          </Grid.Col>
        </Grid>

        <Card withBorder p="lg" radius="md" shadow="sm">
          <Stack align="center" justify="center" gap="md" py="xl">
            <ThemeIcon size={60} radius="md" variant="light" color="indigo">
              <IconChartBar size="2rem" />
            </ThemeIcon>
            <Text fw={600} size="xl">Daily Money Spent</Text>
            <Text size="sm" c="dimmed" ta="center">Daily spending chart will be displayed here</Text>
          </Stack>
        </Card>
      </Stack>

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
