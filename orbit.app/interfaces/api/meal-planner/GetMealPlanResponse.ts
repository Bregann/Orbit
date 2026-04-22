export interface GetMealPlanResponse {
  entries: MealPlanItem[]
}

export interface MealPlanItem {
  id: number
  date: string
  mealType: string
  recipeId: number
  recipeName: string
}
