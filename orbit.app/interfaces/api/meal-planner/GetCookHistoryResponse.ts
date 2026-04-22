export interface GetCookHistoryResponse {
  history: CookHistoryItem[]
}

export interface CookHistoryItem {
  id: number
  cookedAt: string
  recipeId: number
  recipeName: string
}
