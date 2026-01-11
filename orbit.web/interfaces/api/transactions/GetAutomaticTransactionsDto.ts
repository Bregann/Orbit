export interface GetAutomaticTransactionsDto {
  automaticTransactions: AutomaticTransaction[]
}

export interface AutomaticTransaction {
  id: number
  merchantName: string
  potId: number | null
  isSubscription: boolean
}
