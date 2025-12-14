export interface GetShoppingListItemsResponse {
  items: ShoppingListItem[]
}

export interface ShoppingListItem {
  id: number
  name: string
  addedAt: string
  isPurchased: boolean
}
