using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Stats.Responses
{
    public class GetHomepageStatsDto
    {
        public required decimal MoneyIn { get; set; }
        public required decimal MoneySpent { get; set; }
        public required decimal MoneyLeft { get; set; }
        public required decimal TotalInSavings { get; set; }
        public required decimal TotalInSpendingPots { get; set; }
    }
}
