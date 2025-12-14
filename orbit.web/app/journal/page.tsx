import JournalComponent from '@/components/pages/JournalComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetJournalEntriesResponse } from '@/interfaces/api/journal/GetJournalEntriesResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal'
}

export default async function JournalPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['journalEntries'],
      queryFn: async () => await doQueryGet<GetJournalEntriesResponse>('/api/journal/GetJournalEntries', { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <JournalComponent />
      </HydrationBoundary>
    )
  }

  return <JournalComponent />
}
