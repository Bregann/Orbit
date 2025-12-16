export interface GetYearlyHistoricDataDto {
  monthlySpending: MonthlySpendingData[]
  monthlyLeftOver: MonthlyLeftOverData[]
  monthlySavings: MonthlySavingsData[]
  amountSpentPerPot: AmountSpentPerPotData[]
  amountSavedPerPot: AmountSavedPerPotData[]
}

export interface MonthlySpendingData {
  month: string
  amountSpent: number
}

export interface MonthlyLeftOverData {
  month: string
  amountLeftOver: number
}

export interface MonthlySavingsData {
  month: string
  amountSaved: number
}

export interface AmountSpentPerPotData {
  month: string
  potName: string
  totalAmountSpent: number
}

export interface AmountSavedPerPotData {
  month: string
  potName: string
  totalAmountSaved: number
}
