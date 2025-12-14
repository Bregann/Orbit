'use client'

import {
  Card,
  Stack,
  Group,
  Title,
  Badge,
  Divider,
  Center,
  Text,
  ThemeIcon
} from '@mantine/core'
import { IconReceipt } from '@tabler/icons-react'
import TransactionsTable from '@/components/TransactionsTable'
import { TransactionsTableRow } from '@/interfaces/api/transactions/TransactionsTableRow'
import { PotDropdownValue } from '@/interfaces/api/pots/PotDropdownValue'

interface ThisMonthTransactionsSectionProps {
  transactions: TransactionsTableRow[]
  potOptions: PotDropdownValue[]
}

export default function ThisMonthTransactionsSection({
  transactions,
  potOptions
}: ThisMonthTransactionsSectionProps) {
  return (
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
            {transactions.length} transactions
          </Badge>
        </Group>
        <Divider />
        {transactions.length === 0 ? (
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
            transactions={transactions}
            potOptions={potOptions}
          />
        )}
      </Stack>
    </Card>
  )
}
