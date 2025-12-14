import NotesComponent from '@/components/pages/NotesComponent'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetNotePagesAndFoldersResponse } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Notes | Orbit',
  description: 'Your personal workspace for ideas, notes, and documentation',
}

export default async function NotesPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['notePages'],
      queryFn: async () => await doQueryGet<GetNotePagesAndFoldersResponse>('/api/notes/GetNotePagesAndFolders', { headers: { Cookie: cookieHeader } })
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesComponent />
    </HydrationBoundary>
  )
}
