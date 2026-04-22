import type { RecipeIngredient, RecipeStep } from './AddRecipeRequest'

export interface UpdateRecipeRequest {
  id: number
  name: string
  description: string
  ingredients: RecipeIngredient[] | null
  steps: RecipeStep[] | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
}
