using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Transactions.Requests
{
    public class AddAutomaticTransactionRequest
    {
        public string MerchantName { get; set; } = string.Empty;
        public int PotId { get; set; }
    }
}
