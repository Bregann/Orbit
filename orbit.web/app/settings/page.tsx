import SettingsComponent from '@/components/pages/SettingsComponent'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { FitbitConnectionStatus } from '@/interfaces/api/fitbit/FitbitTypes'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Settings'
}

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  const cookieHeader = `accessToken=${accessToken}; refreshToken=${refreshToken}`

  const queryClient = new QueryClient()

  // Prefetch Fitbit connection status
  await queryClient.prefetchQuery({
    queryKey: [QueryKeys.FitbitConnectionStatus],
    queryFn: async () =>
      await doQueryGet<FitbitConnectionStatus>('/api/fitbit/GetConnectionStatus', {
        cookieHeader
      })
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsComponent />
    </HydrationBoundary>
  )
}
