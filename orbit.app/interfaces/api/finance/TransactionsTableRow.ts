export interface TransactionsTableRow {
  id: string
  merchantName: string
  iconUrl: string
  transactionAmount: number
  transactionDate: Date
  potId: number | null
}
