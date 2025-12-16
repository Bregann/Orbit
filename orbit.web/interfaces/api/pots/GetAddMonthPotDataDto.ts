export interface GetAddMonthPotDataDto {
  spendingPots: AddMonthSpendingPot[]
  savingsPots: AddMonthSavingsPot[]
}

export interface AddMonthSpendingPot {
  potId: number
  potName: string
  amountToAdd: number
  rolloverAmount: string
  rolloverByDefault: boolean
}

export interface AddMonthSavingsPot {
  potId: number
  potName: string
  amountToAdd: number
}
