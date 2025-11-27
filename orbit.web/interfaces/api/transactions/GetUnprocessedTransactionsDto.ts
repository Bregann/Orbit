import { TransactionsTableRow } from './TransactionsTableRow'

export interface GetUnprocessedTransactionsDto {
  unprocessedTransactions: TransactionsTableRow[]
}
