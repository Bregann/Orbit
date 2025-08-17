using FinanceManager.Domain.Database.Context;
using FinanceManager.Domain.DTOs.Pots.Responses;
using FinanceManager.Domain.DTOs.Shared;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.Data.Services
{
    public class PotsService(AppDbContext context) : IPotsService
    {
        public async Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions()
        {
            return new GetSpendingPotDropdownOptionsDto
            {
                PotOptions = await context.SpendingPots
                .Select(p => new PotDropdownValue
                {
                    PotId = p.Id,
                    PotName = p.PotName
                })
                .ToArrayAsync()
            };
        }
    }
}
