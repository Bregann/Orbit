'use client'

import { Grid, Card, Text, Title, Group, ThemeIcon } from '@mantine/core'
import { LineChart, AreaChart, BarChart } from '@mantine/charts'
import { IconChartLine } from '@tabler/icons-react'
import type { GetYearlyHistoricDataDto } from '@/interfaces/api/historicData/GetYearlyHistoricDataDto'

interface YearlyTrendsProps {
  yearlyData: GetYearlyHistoricDataDto
}

export default function YearlyTrends({ yearlyData }: YearlyTrendsProps) {
  // Combine monthly data for comprehensive view
  const combinedMonthlyData = yearlyData.monthlySpending.map((spending, index) => ({
    month: spending.month,
    spending: spending.amountSpent,
    leftOver: yearlyData.monthlyLeftOver[index]?.amountLeftOver || 0,
    saved: yearlyData.monthlySavings[index]?.amountSaved || 0
  }))

  // Transform savings pot data for stacked chart
  const savingsPerPotByMonth = yearlyData.amountSavedPerPot.reduce((acc, item) => {
    const existing = acc.find((x) => x.month === item.month)
    if (existing) {
      existing[item.potName] = item.totalAmountSaved
    } else {
      acc.push({ month: item.month, [item.potName]: item.totalAmountSaved })
    }
    return acc
  }, [] as any[])

  // Get unique pot names for series
  const savingsPotNames = [...new Set(yearlyData.amountSavedPerPot.map((x) => x.potName))]

  const POT_COLORS = ['teal.6', 'cyan.6', 'yellow.6', 'blue.6', 'grape.6', 'red.6', 'orange.6', 'pink.6']

  return (
    <div style={{ marginTop: '4rem' }}>
      <Group
        justify="space-between"
        align="center"
        mb="lg"
        p="md"
        style={{ borderLeft: '4px solid var(--mantine-color-teal-6)' }}
      >
        <Group gap="sm">
          <ThemeIcon size="xl" radius="md" variant="filled" color="teal">
            <IconChartLine size="1.5rem" />
          </ThemeIcon>
          <div>
            <Title order={2} size="h2">
              Year-on-Year Trends
            </Title>
            <Text size="sm" c="dimmed">
              Last 12 Months Overview
            </Text>
          </div>
        </Group>
      </Group>
      <Grid gutter="md">
        {combinedMonthlyData.length > 0 && (
          <>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Text fw={600} size="lg" mb="md">
                  Monthly Spending - 12 Month Trend
                </Text>
                <LineChart
                  h={300}
                  data={combinedMonthlyData}
                  dataKey="month"
                  series={[{ name: 'spending', color: 'red.6' }]}
                  curveType="monotone"
                  tickLine="xy"
                  gridAxis="xy"
                  valueFormatter={(value) => `£${value.toFixed(2)}`}
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Text fw={600} size="lg" mb="md">
                  Amount Left Over - 12 Month Trend
                </Text>
                <AreaChart
                  h={300}
                  data={combinedMonthlyData}
                  dataKey="month"
                  series={[{ name: 'leftOver', color: 'blue.6' }]}
                  curveType="monotone"
                  tickLine="xy"
                  gridAxis="xy"
                  withGradient
                  valueFormatter={(value) => `£${value.toFixed(2)}`}
                />
              </Card>
            </Grid.Col>
          </>
        )}
        {savingsPerPotByMonth.length > 0 && (
          <Grid.Col span={12}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Text fw={600} size="lg" mb="md">
                Amount Saved Per Pot - 12 Month Comparison
              </Text>
              <BarChart
                h={300}
                data={savingsPerPotByMonth}
                dataKey="month"
                series={savingsPotNames.map((name, index) => ({
                  name,
                  color: POT_COLORS[index % POT_COLORS.length]
                }))}
                tickLine="y"
                gridAxis="y"
                type="stacked"
                valueFormatter={(value) => `£${value.toFixed(2)}`}
              />
            </Card>
          </Grid.Col>
        )}
        {combinedMonthlyData.length > 0 && (
          <>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Text fw={600} size="lg" mb="md">
                  Spending vs Savings Trend
                </Text>
                <LineChart
                  h={300}
                  data={combinedMonthlyData}
                  dataKey="month"
                  series={[
                    { name: 'spending', color: 'red.6' },
                    { name: 'saved', color: 'teal.6' }
                  ]}
                  curveType="monotone"
                  tickLine="xy"
                  gridAxis="xy"
                  valueFormatter={(value) => `£${value.toFixed(2)}`}
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Text fw={600} size="lg" mb="md">
                  Complete Financial Overview
                </Text>
                <BarChart
                  h={300}
                  data={combinedMonthlyData}
                  dataKey="month"
                  series={[
                    { name: 'spending', color: 'red.6' },
                    { name: 'saved', color: 'teal.6' },
                    { name: 'leftOver', color: 'blue.6' }
                  ]}
                  tickLine="y"
                  gridAxis="y"
                  valueFormatter={(value) => `£${value.toFixed(2)}`}
                />
              </Card>
            </Grid.Col>
          </>
        )}
      </Grid>
    </div>
  )
}
