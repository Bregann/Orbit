export interface GetAddMonthPotDataDto {
  spendingPots: AddMonthSpendingPot[]
  savingsPots: AddMonthSavingsPot[]
}

export interface AddMonthSpendingPot {
  potId: number
  potName: string
  amountToAdd: number
  rolloverAmount: string
}

export interface AddMonthSavingsPot {
  potId: number
  potName: string
  amountToAdd: number
}
