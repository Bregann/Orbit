import MealPlannerComponent from '@/components/pages/MealPlannerComponent'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetRecipesResponse } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import type { GetMealPlanResponse } from '@/interfaces/api/meal-planner/GetMealPlanResponse'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { QueryKeys } from '@/helpers/QueryKeys'
import { getCurrentWeekRange } from '@/helpers/dateHelper'

export const metadata: Metadata = {
  title: 'Meal Planner'
}

export default async function MealPlannerPage() {
  const queryClient = new QueryClient()
  const cookieStore = await cookies()

  // Must match the week MealPlannerComponent renders (Monday-start, local
  // dates). Using toISOString() here would prefetch a different range to the
  // one the client asks for, so the cache would always miss.
  const { startDate, endDate } = getCurrentWeekRange()

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
