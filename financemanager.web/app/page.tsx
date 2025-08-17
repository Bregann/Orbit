import HomeComponent from '@/components/pages/HomeComponent'
import { doGet } from '@/helpers/apiClient'
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
      queryFn: () => doGet<GetHomepageStatsDto>('/api/stats/GetHomepageStats', { cookieHeader }),
    })

    await queryClient.fetchQuery({
      queryKey: ['unprocessedTransactions'],
      queryFn: () => doGet<GetUnprocessedTransactionsDto>('/api/transactions/GetUnprocessedTransactions', { cookieHeader }),
    })

    await queryClient.fetchQuery({
      queryKey: ['getSpendingPotDropdownOptions'],
      queryFn: () => doGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions', { cookieHeader }),
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomeComponent />
      </HydrationBoundary>
    )
  }
}
