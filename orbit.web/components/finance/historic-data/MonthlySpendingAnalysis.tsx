'use client'

import { Card, Grid, Group, Text, Table } from '@mantine/core'
import { DonutChart } from '@mantine/charts'
import type { PotSpendingData } from '@/interfaces/api/historicData/GetHistoricMonthDataDto'

interface MonthlySpendingAnalysisProps {
  potSpendings: PotSpendingData[]
}

const CHART_COLORS = ['blue.6', 'cyan.6', 'grape.6', 'red.6', 'yellow.6', 'teal.6', 'orange.6', 'pink.6']

export default function MonthlySpendingAnalysis({ potSpendings }: MonthlySpendingAnalysisProps) {
  const totalSpent = potSpendings.reduce((sum, pot) => sum + pot.amountSpent, 0)

  const chartData = potSpendings.map((pot, index) => ({
    name: pot.potName,
    value: pot.amountSpent,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Grid gutter="lg" align="center">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group justify="center">
            <div>
              <Text fw={600} size="lg" mb="md" ta="center">
                Spent Per Pot
              </Text>
              <DonutChart
                data={chartData}
                chartLabel={`Total: £${totalSpent.toFixed(2)}`}
                size={200}
                thickness={30}
              />
            </div>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text fw={600} size="lg" mb="md">
            Spending Breakdown
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Pot</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
                <Table.Th ta="right">%</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {potSpendings.map((item, index) => (
                <Table.Tr key={item.potName}>
                  <Table.Td>
                    <Group gap="xs">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 4,
                          backgroundColor: `var(--mantine-color-${CHART_COLORS[index % CHART_COLORS.length]})`
                        }}
                      />
                      {item.potName}
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right" fw={500}>
                    £{item.amountSpent.toFixed(2)}
                  </Table.Td>
                  <Table.Td ta="right" c="dimmed">
                    {item.percentageOfTotalSpent.toFixed(1)}%
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Grid.Col>
      </Grid>
    </Card>
  )
}
