export interface GetManagePotDataDto {
  pots: ManagePotData[]
}

export interface ManagePotData {
  potId: number
  potName: string
  amountToAdd: number
  isSavingsPot: boolean
  rolloverByDefault: boolean
}
