'use client'

import { Card, Grid, Text, Table, Badge } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import type { TopTransactionsData } from '@/interfaces/api/historicData/GetHistoricMonthDataDto'

interface LargestTransactionsProps {
  topTransactions: TopTransactionsData[]
}

export default function LargestTransactions({ topTransactions }: LargestTransactionsProps) {
  const chartData = topTransactions.map((transaction) => ({
    merchant: transaction.merchantName,
    amount: transaction.amountSpent
  }))

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text fw={600} size="lg" mb="md">
            Largest Transactions
          </Text>
          {chartData.length > 0 ? (
            <BarChart
              h={250}
              data={chartData}
              dataKey="merchant"
              series={[{ name: 'amount', color: 'grape.6' }]}
              tickLine="y"
              gridAxis="y"
              valueFormatter={(value) => `£${value.toFixed(2)}`}
            />
          ) : (
            <Text c="dimmed" ta="center" mt="xl">
              No transaction data available
            </Text>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text fw={600} size="lg" mb="md">
            Top 5 Transactions
          </Text>
          {topTransactions.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Merchant</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Pot</Table.Th>
                  <Table.Th ta="right">Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topTransactions.map((item) => (
                  <Table.Tr key={item.merchantName + item.transactionDate}>
                    <Table.Td fw={500}>{item.merchantName}</Table.Td>
                    <Table.Td c="dimmed">
                      {new Date(item.transactionDate).toLocaleDateString('en-GB')}
                    </Table.Td>
                    <Table.Td>
                      {item.potName ? (
                        <Badge size="sm" variant="dot">
                          {item.potName}
                        </Badge>
                      ) : (
                        <Text c="dimmed" size="sm">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right" fw={500}>
                      £{item.amountSpent.toFixed(2)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed" ta="center" mt="xl">
              No transaction data available
            </Text>
          )}
        </Grid.Col>
      </Grid>
    </Card>
  )
}
