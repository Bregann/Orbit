using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Transactions.Requests
{
    public class UpdateTransactionRequest
    {
        public required int TransactionId { get; set; }
        public int? PotId { get; set; }
    }
}
