using Orbit.Domain.DTOs.Finance.Transactions;

namespace Orbit.Domain.DTOs.Finance.Transactions.Responses
{
    public class GetTransactionsForCurrentMonthDto
    {
        public required TransactionsTableRow[] Transactions { get; set; }
    }
}
