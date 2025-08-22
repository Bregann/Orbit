import ManagementComponent from '@/components/pages/ManagementComponent'
import { doQueryGet } from '@/helpers/apiClient'
import { GetManagePotDataDto } from '@/interfaces/api/pots/GetManagePotDataDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { GetAutomaticTransactionsDto } from '@/interfaces/api/transactions/GetAutomaticTransactionsDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'

export default async function Management() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['managePotData'],
      queryFn: async () => await doQueryGet<GetManagePotDataDto>('/api/pots/GetManagePotData', { cookieHeader })
    })

    await queryClient.prefetchQuery({
      queryKey: ['getSpendingPotDropdownOptions'],
      queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions', { cookieHeader }),
    })

    await queryClient.prefetchQuery({
      queryKey: ['getAutomaticTransactions'],
      queryFn: async () => await doQueryGet<GetAutomaticTransactionsDto>('/api/transactions/GetAutomaticTransactions', { cookieHeader })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ManagementComponent />
      </HydrationBoundary>
    )
  }
}
