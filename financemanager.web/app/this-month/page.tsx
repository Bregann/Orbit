import ThisMonthComponent from '@/components/pages/ThisMonthComponent'
import { doGet } from '@/helpers/apiClient'
import { GetAllPotDataDto } from '@/interfaces/api/pots/GetAllPotDataDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { GetTransactionsForCurrentMonthDto } from '@/interfaces/api/transactions/GetTransactionsForCurrentMonthDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'

export default async function ThisMonthPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['potBreakdownData'],
      queryFn: async () => doGet<GetAllPotDataDto>('/api/Pots/GetAllPotData', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.fetchQuery({
      queryKey: ['getSpendingPotDropdownOptions'],
      queryFn: () => doGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions', { cookieHeader }),
    })

    await queryClient.fetchQuery({
      queryKey: ['thisMonthTransactions'],
      queryFn: () => doGet<GetTransactionsForCurrentMonthDto>('/api/transactions/GetTransactionsForMonth', { cookieHeader }),
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ThisMonthComponent />
      </HydrationBoundary>
    )
  }

}
