using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Transactions.Responses
{
    public class GetAutomaticTransactionsDto
    {
        public required AutomaticTransaction[] AutomaticTransactions { get; set; }
    }

    public class AutomaticTransaction
    {
        public required int Id { get; set; }
        public required string MerchantName { get; set; }
        public required int PotId { get; set; }
    }
}
