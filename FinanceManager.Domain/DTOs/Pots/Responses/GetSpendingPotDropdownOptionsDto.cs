using FinanceManager.Domain.DTOs.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.DTOs.Pots.Responses
{
    public class GetSpendingPotDropdownOptionsDto
    {
        public required PotDropdownValue[] PotOptions { get; set; }
    }
}
