import DashboardComponent from '@/components/pages/DashboardComponent'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetDashboardOverviewDataDto } from '@/interfaces/api/dashboard/GetDashboardOverviewDataDto'

export const metadata: Metadata = {
  title: 'Dashboard'
}

export default async function Home() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  const cookieHeader = `accessToken=${accessToken}; refreshToken=${refreshToken}`

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () =>
      await doQueryGet<GetDashboardOverviewDataDto>('/api/Dashboard/GetDashboardOverviewData', {
        cookieHeader
      })
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardComponent />
    </HydrationBoundary>
  )
}
