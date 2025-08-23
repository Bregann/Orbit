namespace FinanceManager.Domain.DTOs.Transactions.Responses
{
    public class GetUnprocessedTransactionsDto
    {
        public required TransactionsTableRow[] UnprocessedTransactions { get; set; }
    }
}
