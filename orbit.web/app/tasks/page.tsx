import TasksComponent from '@/components/pages/TasksComponent'
import { doQueryGet } from '@/helpers/apiClient'
import { GetTasksResponse, GetTaskCategoriesResponse } from '@/interfaces/api/tasks'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks'
}

export default async function TasksPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['tasks'],
      queryFn: async () => await doQueryGet<GetTasksResponse>('/api/tasks/GetTasks', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: ['taskCategories'],
      queryFn: async () => await doQueryGet<GetTaskCategoriesResponse>('/api/tasks/GetTaskCategories', { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TasksComponent />
      </HydrationBoundary>
    )
  }

  return <TasksComponent />
}
