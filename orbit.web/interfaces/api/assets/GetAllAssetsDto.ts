import type { AssetStatus } from '@/helpers/assetOptions'

export interface GetAllAssetsDto {
  assets: AssetItem[]
}

export interface AssetItem {
  assetId: number
  assetName: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: string
  purchasePrice: number | null
  location: string | null
  warrantyExpirationDate: string | null
  notes: string | null
  status: AssetStatus
  categoryId: number
  categoryName: string
  hasReceipt: boolean
  hasManual: boolean
  createdAt: string
  lastUpdatedAt: string | null
}
