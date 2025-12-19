import HistoricDataComponent from '@/components/pages/HistoricDataComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetHistoricMonthsDropdownValuesDto } from '@/interfaces/api/historicData/GetHistoricMonthsDropdownValuesDto'
import type { GetHistoricMonthDataDto } from '@/interfaces/api/historicData/GetHistoricMonthDataDto'
import type { GetYearlyHistoricDataDto } from '@/interfaces/api/historicData/GetYearlyHistoricDataDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Historic Data'
}

export default async function HistoricDataPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    // Prefetch historic months dropdown
    const monthsDropdown = await queryClient.fetchQuery({
      queryKey: [QueryKeys.HistoricMonthsDropdownValues],
      queryFn: async () =>
        await doQueryGet<GetHistoricMonthsDropdownValuesDto>(
          '/api/HistoricMonth/GetHistoricMonthsDropdownValues',
          { headers: { Cookie: cookieHeader } }
        )
    })

    // Prefetch the first month's data if available
    if (monthsDropdown && monthsDropdown.months.length > 0) {
      const firstMonthId = monthsDropdown.months[0].id

      await queryClient.prefetchQuery({
        queryKey: [QueryKeys.HistoricMonthData, firstMonthId.toString()],
        queryFn: async () =>
          await doQueryGet<GetHistoricMonthDataDto>(
            `/api/HistoricMonth/GetHistoricMonthData?monthId=${firstMonthId}`,
            { headers: { Cookie: cookieHeader } }
          )
      })
    }

    // Prefetch yearly data
    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.YearlyHistoricData],
      queryFn: async () =>
        await doQueryGet<GetYearlyHistoricDataDto>(
          '/api/HistoricMonth/GetYearlyHistoricData',
          { headers: { Cookie: cookieHeader } }
        )
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HistoricDataComponent />
      </HydrationBoundary>
    )
  }

  return <HistoricDataComponent />
}
