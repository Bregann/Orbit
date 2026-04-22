export interface RecipeIngredient {
  name: string
  quantity: string | null
}

export interface RecipeStep {
  stepNumber: number
  instruction: string
}

export interface AddRecipeRequest {
  name: string
  description: string
  ingredients: RecipeIngredient[] | null
  steps: RecipeStep[] | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
}
