import ThisMonthComponent from '@/components/pages/ThisMonthComponent'
import { doQueryGet } from '@/helpers/apiClient'
import { GetAllPotDataDto } from '@/interfaces/api/pots/GetAllPotDataDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { GetTransactionsForCurrentMonthDto } from '@/interfaces/api/transactions/GetTransactionsForCurrentMonthDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'This Month'
}

export default async function ThisMonthPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.GetAllPotData],
      queryFn: async () => await doQueryGet<GetAllPotDataDto>('/api/Pots/GetAllPotData', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.GetSpendingPotDropdownOptions],
      queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions', { headers: { Cookie: cookieHeader } }),
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.ThisMonthTransactions],
      queryFn: async () => await doQueryGet<GetTransactionsForCurrentMonthDto>('/api/transactions/GetTransactionsForMonth', { headers: { Cookie: cookieHeader } }),
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ThisMonthComponent />
      </HydrationBoundary>
    )
  }

}
