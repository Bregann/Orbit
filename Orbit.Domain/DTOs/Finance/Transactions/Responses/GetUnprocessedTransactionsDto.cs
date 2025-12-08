namespace Orbit.Domain.DTOs.Finance.Transactions.Responses
{
    public class GetUnprocessedTransactionsDto
    {
        public required TransactionsTableRow[] UnprocessedTransactions { get; set; }
    }
}
