import type { RecipeIngredient, RecipeStep } from './AddRecipeRequest'

export interface GetRecipesResponse {
  recipes: RecipeItem[]
}

export interface RecipeItem {
  id: number
  name: string
  description: string
  ingredients: RecipeIngredient[] | null
  steps: RecipeStep[] | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
  createdAt: string
  lastUpdatedAt: string | null
  timesCooked: number
  lastCooked: string | null
}
