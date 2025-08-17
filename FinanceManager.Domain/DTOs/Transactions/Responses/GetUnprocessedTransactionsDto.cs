using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Transactions.Responses
{
    public class GetUnprocessedTransactionsDto
    {
        public required TransactionsTableRow[] UnprocessedTransactions { get; set; }
    }
}
