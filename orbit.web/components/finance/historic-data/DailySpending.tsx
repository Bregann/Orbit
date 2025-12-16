'use client'

import { Card, Group, Text, ThemeIcon } from '@mantine/core'
import { AreaChart } from '@mantine/charts'
import { IconChartBar } from '@tabler/icons-react'
import type { SpendingPerDayData } from '@/interfaces/api/historicData/GetHistoricMonthDataDto'

interface DailySpendingProps {
  spendingPerDay: SpendingPerDayData[]
}

export default function DailySpending({ spendingPerDay }: DailySpendingProps) {
  const chartData = spendingPerDay.map((day) => ({
    date: new Date(day.date).getDate().toString(),
    amount: day.amountSpent
  }))

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group mb="md" gap="sm">
        <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
          <IconChartBar size="1.2rem" />
        </ThemeIcon>
        <Text fw={600} size="xl">
          Daily Money Spent
        </Text>
      </Group>
      {chartData.length > 0 ? (
        <AreaChart
          h={300}
          data={chartData}
          dataKey="date"
          series={[{ name: 'amount', color: 'indigo.6' }]}
          curveType="bump"
          tickLine="xy"
          gridAxis="xy"
          withGradient
          valueFormatter={(value) => `£${value.toFixed(2)}`}
        />
      ) : (
        <Text c="dimmed" ta="center" mt="xl">
          No daily spending data available
        </Text>
      )}
    </Card>
  )
}
