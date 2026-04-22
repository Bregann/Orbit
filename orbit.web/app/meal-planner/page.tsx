import MealPlannerComponent from '@/components/pages/MealPlannerComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetRecipesResponse } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import type { GetMealPlanResponse } from '@/interfaces/api/meal-planner/GetMealPlanResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'

export const metadata: Metadata = {
  title: 'Meal Planner'
}

export default async function MealPlannerPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  const today = new Date()
  const startDate = today.toISOString().split('T')[0]
  const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  if (cookieStore.has('accessToken')) {
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.Recipes],
      queryFn: async () => await doQueryGet<GetRecipesResponse>('/api/mealplanner/GetRecipes', { headers: { Cookie: cookieHeader } })
    })

    await queryClient.prefetchQuery({
      queryKey: [QueryKeys.MealPlan, startDate, endDate],
      queryFn: async () => await doQueryGet<GetMealPlanResponse>(`/api/mealplanner/GetMealPlan?startDate=${startDate}&endDate=${endDate}`, { headers: { Cookie: cookieHeader } })
    })

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MealPlannerComponent />
      </HydrationBoundary>
    )
  }

  return <MealPlannerComponent />
}
