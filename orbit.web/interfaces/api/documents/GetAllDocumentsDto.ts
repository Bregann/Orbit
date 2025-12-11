export interface GetAllDocumentsDto {
  documents: DocumentItem[]
}

export interface DocumentItem {
  documentId: number
  documentName: string
  documentType: string
  categoryId: number
  uploadedAt: string
}
