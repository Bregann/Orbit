export interface GetAllAssetCategoriesDto {
  categories: AssetCategoryItem[]
}

export interface AssetCategoryItem {
  categoryId: number
  categoryName: string
  description: string | null
  assetCount: number
}
