import HomeComponent from '@/components/pages/HomeComponent'
import { doQueryGet } from '@/helpers/apiClient'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { GetHomepageStatsDto } from '@/interfaces/api/stats/GetHomepageStatsDto'
import { GetUnprocessedTransactionsDto } from '@/interfaces/api/transactions/GetUnprocessedTransactionsDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'

export default async function Home() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['homepage-stats'],
      queryFn: async () => await doQueryGet<GetHomepageStatsDto>('/api/stats/GetHomepageStats', { headers: { Cookie: cookieHeader } }),
    })

    await queryClient.prefetchQuery({
      queryKey: ['unprocessedTransactions'],
      queryFn: async () => await doQueryGet<GetUnprocessedTransactionsDto>('/api/transactions/GetUnprocessedTransactions', { headers: { Cookie: cookieHeader } }),
    })

    await queryClient.prefetchQuery({
      queryKey: ['getSpendingPotDropdownOptions'],
      queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions', { headers: { Cookie: cookieHeader } }),
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeComponent />
      </HydrationBoundary>
    )
  }
}
