export interface GetAllPotDataDto {
  spendingPots: SpendingPotData[]
  savingsPots: SavingsPotData[]
}

export interface SpendingPotData {
  potId: number
  potName: string
  amountAllocated: string
  amountLeft: string
  amountSpent: string
}

export interface SavingsPotData {
  potId: number
  potName: string
  amountSaved: string
  amountAddedThisMonth: string
}
