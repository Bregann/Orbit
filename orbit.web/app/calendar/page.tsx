import CalendarComponent from '@/components/pages/CalendarComponent'
import { doQueryGet } from '@/helpers/apiClient'
import { GetCalendarEventsDto } from '@/interfaces/api/calendar/GetCalendarEventsDto'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Calendar'
}

export default async function CalendarPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.CalendarEvents],
      queryFn: async () => await doQueryGet<GetCalendarEventsDto>('/api/calendar/GetCalendarEvents', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.CalendarEventTypes],
      queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes', { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CalendarComponent />
      </HydrationBoundary>
    )
  }

  return <CalendarComponent />
}
