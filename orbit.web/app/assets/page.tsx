import AssetsComponent from '@/components/pages/AssetsComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetAllAssetsDto } from '@/interfaces/api/assets/GetAllAssetsDto'
import type { GetAllAssetCategoriesDto } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Assets'
}

export default async function AssetsPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.Assets],
      queryFn: async () => await doQueryGet<GetAllAssetsDto>('/api/assets/GetAllAssets', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.AssetCategories],
      queryFn: async () => await doQueryGet<GetAllAssetCategoriesDto>('/api/assets/GetAllAssetCategories', { headers: { Cookie: cookieHeader } })
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetsComponent />
    </HydrationBoundary>
  )
}
