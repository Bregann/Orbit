namespace FinanceManager.Domain.DTOs.Transactions.Responses
{
    public class GetTransactionsForCurrentMonthDto
    {
        public required TransactionsTableRow[] Transactions { get; set; }
    }
}