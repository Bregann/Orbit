export interface CreateAssetRequest {
  assetName: string
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  purchaseDate: string
  purchasePrice?: number | null
  location?: string | null
  warrantyExpirationDate?: string | null
  notes?: string | null
  status: string
  categoryId: number
}
