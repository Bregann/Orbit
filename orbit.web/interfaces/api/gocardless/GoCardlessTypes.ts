export interface GoCardlessConnectionStatus {
  hasActiveConnections: boolean
  connections: GoCardlessBankConnection[]
}

export interface GoCardlessBankConnection {
  id: number
  institutionId: string
  institutionName: string
  accountId: string
  accountName?: string
  status: string
  createdAt: string
  expiresAt: string
  daysUntilExpiry: number
  isExpiringSoon: boolean
  lastSuccessfulSync?: string
  lastSyncError?: string
}

export interface GoCardlessInstitution {
  id: string
  name: string
  bic: string
  logo: string
  countries: string[]
}

export interface GoCardlessInitiateConnectionResponse {
  authorizationUrl: string
  requisitionId: string
}
