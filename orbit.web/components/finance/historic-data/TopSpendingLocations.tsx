'use client'

import { Card, Grid, Text, Table, Badge } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import type { TopSpendingMerchantsData } from '@/interfaces/api/historicData/GetHistoricMonthDataDto'

interface TopSpendingLocationsProps {
  topMerchants: TopSpendingMerchantsData[]
}

export default function TopSpendingLocations({ topMerchants }: TopSpendingLocationsProps) {
  const chartData = topMerchants.map((merchant) => ({
    place: merchant.merchantName,
    amount: merchant.amountSpent,
    transactions: merchant.transactionsCount
  }))

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text fw={600} size="lg" mb="md">
            Top Places Money Spent
          </Text>
          {chartData.length > 0 ? (
            <BarChart
              h={250}
              data={chartData}
              dataKey="place"
              series={[{ name: 'amount', color: 'blue.6' }]}
              tickLine="y"
              gridAxis="y"
              valueFormatter={(value) => `£${value.toFixed(2)}`}
            />
          ) : (
            <Text c="dimmed" ta="center" mt="xl">
              No spending data available
            </Text>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text fw={600} size="lg" mb="md">
            Top Merchants
          </Text>
          {topMerchants.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Merchant</Table.Th>
                  <Table.Th ta="right">Transactions</Table.Th>
                  <Table.Th ta="right">Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topMerchants.map((item, index) => (
                  <Table.Tr key={item.merchantName}>
                    <Table.Td>
                      <Badge size="sm" variant="light" color="blue" mr="xs">
                        #{index + 1}
                      </Badge>
                      {item.merchantName}
                    </Table.Td>
                    <Table.Td ta="right" c="dimmed">
                      {item.transactionsCount}
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
              No merchant data available
            </Text>
          )}
        </Grid.Col>
      </Grid>
    </Card>
  )
}
