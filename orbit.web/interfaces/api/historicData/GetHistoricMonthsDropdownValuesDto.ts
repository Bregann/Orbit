export interface GetHistoricMonthsDropdownValuesDto {
  months: HistoricMonthDropdownValueDto[]
}

export interface HistoricMonthDropdownValueDto {
  id: number
  displayName: string
}
