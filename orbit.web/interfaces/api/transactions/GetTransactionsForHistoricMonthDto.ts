import { TransactionsTableRow } from './TransactionsTableRow'

export interface GetTransactionsForHistoricMonthDto {
  transactions: TransactionsTableRow[]
  month: string
  year: string
}
