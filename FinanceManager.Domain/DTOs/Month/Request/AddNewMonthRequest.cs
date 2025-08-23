using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Month.Request
{
    public class AddNewMonthRequest
    {
        public required decimal MonthlyIncome { get; set; }
        public required int[] PotIdsToRollover { get; set; }
        public required NewMonthPotData[] SpendingPots { get; set; }
        public required NewMonthPotData[] SavingsPots { get; set; }
    }

    public class NewMonthPotData
    {
        public required int PotId { get; set; }
        public required decimal AmountToAdd { get; set; }
    }
}
