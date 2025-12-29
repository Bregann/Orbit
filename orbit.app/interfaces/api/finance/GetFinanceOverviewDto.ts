export interface GetFinanceOverviewDto {
  currentMonthSummary: MonthSummary;
  budgetPots: BudgetPot[];
  pendingTransactions: PendingTransaction[];
}

export interface MonthSummary {
  moneyIn: number;
  moneySpent: number;
  totalSaved: number;
  moneyLeft: number;
}

export interface BudgetPot {
  id: number;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface PendingTransaction {
  id: number;
  merchant: string;
  amount: number;
  date: string;
  potType: string;
  icon?: string;
}
