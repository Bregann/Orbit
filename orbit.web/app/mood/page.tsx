import MoodTrackerComponent from '@/components/pages/MoodTrackerComponent'
import { doQueryGet } from '@/helpers/apiClient'
import { GetYearlyMoodResponse } from '@/interfaces/api/mood/GetYearlyMoodResponse'
import { GetTodaysMoodResponse } from '@/interfaces/api/mood/GetTodaysMoodResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'
import { GetAvailableYearsResponse } from '@/interfaces/api/mood/GetAvailableYearsResponse'

export const metadata: Metadata = {
  title: 'Mood Tracker'
}

export default async function MoodTrackerPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()
  const currentYear = new Date().getFullYear()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.YearlyMoodData, currentYear.toString()],
      queryFn: async () => await doQueryGet<GetYearlyMoodResponse>(`/api/Mood/GetYearlyMood?year=${currentYear}`, { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.TodaysMood],
      queryFn: async () => await doQueryGet<GetTodaysMoodResponse>('/api/Mood/GetTodaysMood', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.AvailableYears],
      queryFn: async () => await doQueryGet<GetAvailableYearsResponse>('/api/Mood/GetAvailableYears', { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MoodTrackerComponent />
      </HydrationBoundary>
    )
  }

  return <MoodTrackerComponent />
}
