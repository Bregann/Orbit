import ChoresComponent from '@/components/pages/ChoresComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetChoresResponse } from '@/interfaces/api/chores/GetChoresResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Chores'
}

export default async function ChoresPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.Chores],
      queryFn: async () => await doQueryGet<GetChoresResponse>('/api/chores/GetChores', { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ChoresComponent />
      </HydrationBoundary>
    )
  }

  return <ChoresComponent />
}
