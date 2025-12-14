import ShoppingComponent from '@/components/pages/ShoppingComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetShoppingListItemsResponse } from '@/interfaces/api/shopping/GetShoppingListItemsResponse'
import type { GetShoppingListQuickAddItemsResponse } from '@/interfaces/api/shopping/GetShoppingListQuickAddItemsResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shopping List'
}

export default async function ShoppingPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['shoppingListItems'],
      queryFn: async () => await doQueryGet<GetShoppingListItemsResponse>('/api/shopping/GetShoppingListItems', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: ['shoppingListQuickAddItems'],
      queryFn: async () => await doQueryGet<GetShoppingListQuickAddItemsResponse>('/api/shopping/GetShoppingListQuickAddItems', { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ShoppingComponent />
      </HydrationBoundary>
    )
  }

  return <ShoppingComponent />
}

