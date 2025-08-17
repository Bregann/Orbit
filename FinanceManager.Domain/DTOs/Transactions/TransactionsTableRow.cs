using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Transactions
{
    public class TransactionsTableRow
    {
        public required string Id { get; set; }
        public required string MerchantName { get; set; }
        public required string IconUrl { get; set; }
        public required decimal TransactionAmount { get; set; }
        public required DateTime TransactionDate { get; set; }
        public int? PotId { get; set; }
    }
}
