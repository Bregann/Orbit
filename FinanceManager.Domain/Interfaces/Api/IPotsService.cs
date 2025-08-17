using FinanceManager.Domain.DTOs.Pots.Responses;
using FinanceManager.Domain.DTOs.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface IPotsService
    {
        Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions();
    }
}
