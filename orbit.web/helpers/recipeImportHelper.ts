import type { AddRecipeRequest, RecipeIngredient, RecipeStep } from '@/interfaces/api/meal-planner/AddRecipeRequest'

export const recipeAiPrompt = `Convert the recipe I give you into JSON so I can import it into my recipe app.

Rules:
- Reply with ONLY the JSON object. No markdown code fences, no commentary.
- Use exactly this shape and these property names:

{
  "name": "string - the recipe title",
  "description": "string - one or two sentences describing the dish",
  "prepTimeMinutes": number or null,
  "cookTimeMinutes": number or null,
  "servings": number or null,
  "ingredients": [
    { "name": "string - ingredient only, e.g. \\"Chicken breast\\"", "quantity": "string or null - amount and unit, e.g. \\"500g\\" or \\"2 tbsp\\"" }
  ],
  "steps": [
    "string - one instruction per item, in order"
  ]
}

- Times must be whole numbers of minutes (convert hours to minutes).
- Keep ingredient names short and capitalised (e.g. "Garlic", "Olive oil"); put the amount in "quantity", not in "name".
- Prefer metric units (g, ml, tsp, tbsp) where the recipe allows.
- Write each step as a single clear instruction. Do not number the steps.
- If something is not stated in the recipe, use null rather than guessing.

Here is the recipe:
`

export type ImportedRecipe = Omit<AddRecipeRequest, 'ingredients' | 'steps'> & {
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null
}

const toOptionalString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str === '' ? null : str
}

// Throws an Error with a user-friendly message if the JSON can't be used
export const parseRecipeJson = (input: string): ImportedRecipe => {
  // AI tools often wrap JSON in ```json fences despite being told not to
  const cleaned = input.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

  let data: unknown
  try {
    data = JSON.parse(cleaned)
  } catch {
    throw new Error('That isn\'t valid JSON. Check you copied the whole response.')
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Expected a JSON object with recipe fields.')
  }

  const recipe = data as Record<string, unknown>
  const name = toOptionalString(recipe.name)
  if (name === null) throw new Error('The recipe JSON is missing a "name".')

  const rawIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const ingredients: RecipeIngredient[] = rawIngredients
    .map((i): RecipeIngredient | null => {
      if (typeof i === 'string') return toOptionalString(i) !== null ? { name: i.trim(), quantity: null } : null
      if (typeof i !== 'object' || i === null) return null
      const item = i as Record<string, unknown>
      const ingredientName = toOptionalString(item.name)
      return ingredientName !== null ? { name: ingredientName, quantity: toOptionalString(item.quantity) } : null
    })
    .filter((i): i is RecipeIngredient => i !== null)

  // Accept plain strings or { instruction } objects, ordered by stepNumber if given
  const rawSteps = Array.isArray(recipe.steps) ? recipe.steps : []
  const steps: RecipeStep[] = rawSteps
    .map((s, index) => {
      if (typeof s === 'string') return { order: index, instruction: s.trim() }
      if (typeof s !== 'object' || s === null) return null
      const item = s as Record<string, unknown>
      return { order: toOptionalNumber(item.stepNumber) ?? index, instruction: toOptionalString(item.instruction) ?? '' }
    })
    .filter((s): s is { order: number, instruction: string } => s !== null && s.instruction !== '')
    .sort((a, b) => a.order - b.order)
    .map((s, index) => ({ stepNumber: index + 1, instruction: s.instruction }))

  return {
    name,
    description: toOptionalString(recipe.description) ?? '',
    prepTimeMinutes: toOptionalNumber(recipe.prepTimeMinutes),
    cookTimeMinutes: toOptionalNumber(recipe.cookTimeMinutes),
    servings: toOptionalNumber(recipe.servings),
    ingredients,
    steps
  }
}
