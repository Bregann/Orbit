using Orbit.Domain.DTOs.Finance.Transactions;

namespace Orbit.Domain.DTOs.Finance.Transactions.Responses
{
    public class GetUnprocessedTransactionsDto
    {
        public required TransactionsTableRow[] UnprocessedTransactions { get; set; }
    }
}
