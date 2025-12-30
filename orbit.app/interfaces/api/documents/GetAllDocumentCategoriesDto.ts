export interface GetAllDocumentCategoriesDto {
  categories: DocumentCategoryItem[]
}

export interface DocumentCategoryItem {
  id: number
  categoryName: string
}
