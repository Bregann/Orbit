import RecipeDetailComponent from '@/components/pages/RecipeDetailComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recipe'
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: ['recipe', id],
      queryFn: async () => await doQueryGet<RecipeItem>(`/api/mealplanner/GetRecipe?recipeId=${id}`, { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RecipeDetailComponent recipeId={parseInt(id)} />
      </HydrationBoundary>
    )
  }

  return <RecipeDetailComponent recipeId={parseInt(id)} />
}
