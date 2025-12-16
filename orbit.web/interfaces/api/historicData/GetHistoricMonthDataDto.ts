export interface GetHistoricMonthDataDto {
  totalSpent: number
  totalSaved: number
  amountLeftOver: number
  spendingDataBreakdown: MonthlySpendingDataBreakdown
  topSpendingMerchants: TopSpendingMerchantsData[]
  topTransactions: TopTransactionsData[]
  spendingPerDay: SpendingPerDayData[]
}

export interface MonthlySpendingDataBreakdown {
  potSpendings: PotSpendingData[]
}

export interface TopSpendingMerchantsData {
  merchantName: string
  transactionsCount: number
  amountSpent: number
}

export interface TopTransactionsData {
  merchantName: string
  transactionDate: string
  amountSpent: number
  potName?: string
}

export interface SpendingPerDayData {
  date: string
  amountSpent: number
}

export interface PotSpendingData {
  potName: string
  amountSpent: number
  percentageOfTotalSpent: number
}
