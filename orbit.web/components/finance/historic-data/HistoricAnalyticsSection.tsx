'use client'

import { Group, Title, ThemeIcon } from '@mantine/core'
import { IconCalendarStats } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetHistoricMonthDataDto } from '@/interfaces/api/historicData/GetHistoricMonthDataDto'
import type { GetYearlyHistoricDataDto } from '@/interfaces/api/historicData/GetYearlyHistoricDataDto'
import MonthlySummaryStats from './MonthlySummaryStats'
import MonthlySpendingAnalysis from './MonthlySpendingAnalysis'
import TopSpendingLocations from './TopSpendingLocations'
import LargestTransactions from './LargestTransactions'
import DailySpending from './DailySpending'
import YearlyTrends from './YearlyTrends'

interface HistoricAnalyticsSectionProps {
  selectedMonthId: string
}

export default function HistoricAnalyticsSection({
  selectedMonthId
}: HistoricAnalyticsSectionProps) {
  // Fetch month data
  const { data: monthData } = useQuery({
    queryKey: ['historicMonthData', selectedMonthId],
    queryFn: async () =>
      await doQueryGet<GetHistoricMonthDataDto>(
        `/api/HistoricMonth/GetHistoricMonthData?monthId=${selectedMonthId}`
      ),
    enabled: !!selectedMonthId
  })

  // Fetch yearly data
  const { data: yearlyData } = useQuery({
    queryKey: ['yearlyHistoricData'],
    queryFn: async () => await doQueryGet<GetYearlyHistoricDataDto>('/api/HistoricMonth/GetYearlyHistoricData')
  })

  if (!monthData || !yearlyData) {
    return null
  }
  return (
    <>
      {/* Monthly Summary Stats */}
      <div>
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconCalendarStats size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Monthly Summary
            </Title>
          </Group>
        </Group>
        <MonthlySummaryStats
          totalSpent={monthData.totalSpent}
          amountSaved={monthData.totalSaved}
          amountLeftOver={monthData.amountLeftOver}
        />
      </div>

      {/* Monthly Analytics - Spending Breakdown */}
      <div>
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
              <IconCalendarStats size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Monthly Spending Analysis
            </Title>
          </Group>
        </Group>
        <MonthlySpendingAnalysis
          potSpendings={monthData.spendingDataBreakdown.potSpendings}
        />
      </div>

      {/* Top Spending Locations */}
      <TopSpendingLocations topMerchants={monthData.topSpendingMerchants} />

      {/* Top Transactions */}
      <LargestTransactions topTransactions={monthData.topTransactions} />

      {/* Daily Spending */}
      <DailySpending spendingPerDay={monthData.spendingPerDay} />

      {/* Year-on-Year Trends (Last 12 Months) */}
      <YearlyTrends yearlyData={yearlyData} />
    </>
  )
}
