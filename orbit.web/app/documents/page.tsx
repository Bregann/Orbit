import DocumentsComponent from '@/components/pages/DocumentsComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetAllDocumentsDto } from '@/interfaces/api/documents/GetAllDocumentsDto'
import type { GetAllDocumentCategoriesDto } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Documents'
}

export default async function DocumentsPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.Documents],
      queryFn: async () => await doQueryGet<GetAllDocumentsDto>('/api/documents/GetAllDocuments', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.DocumentCategories],
      queryFn: async () => await doQueryGet<GetAllDocumentCategoriesDto>('/api/documents/GetAllDocumentCategories', { headers: { Cookie: cookieHeader } })
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsComponent />
    </HydrationBoundary>
  )
}
