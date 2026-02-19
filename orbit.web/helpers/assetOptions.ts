export type AssetStatus = 'Active' | 'Disposed' | 'In Repair' | 'Lost' | 'Sold'

export interface AssetStatusOption {
  value: AssetStatus
  label: string
}

export const assetStatuses: AssetStatusOption[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Disposed', label: 'Disposed' },
  { value: 'In Repair', label: 'In Repair' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Sold', label: 'Sold' }
]

export const getAssetStatusColor = (status: AssetStatus): string => {
  switch (status) {
    case 'Active':
      return 'green'
    case 'Disposed':
      return 'gray'
    case 'In Repair':
      return 'orange'
    case 'Lost':
      return 'red'
    case 'Sold':
      return 'blue'
    default:
      return 'gray'
  }
}
