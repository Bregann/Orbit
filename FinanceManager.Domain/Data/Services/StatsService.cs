using FinanceManager.Domain.Database.Context;
using FinanceManager.Domain.DTOs.Stats.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.Data.Services
{
    public class StatsService(AppDbContext context) : IStatsService
    {
        public async Task<GetHomepageStatsDto> GetHomepageStats()
        {
            // get the latest month from the histroic data
            var latestMonth = await context.HistoricData
                .OrderByDescending(h => h.DateAdded)
                .FirstOrDefaultAsync();

            if (latestMonth == null)
            {
                return new GetHomepageStatsDto
                {
                    MoneyIn = 0,
                    MoneySpent = 0,
                    MoneyLeft = 0,
                    TotalInSavings = 0,
                    TotalInSpendingPots = 0
                };
            }

            // get all the transactions since the date added of the latest month
            var transactions = await context.Transactions
                .Where(t => t.TransactionDate >= latestMonth.DateAdded)
                .ToListAsync();

            var moneySpent = transactions.Sum(t => t.TransactionAmount);

            return new GetHomepageStatsDto
            {
                MoneyIn = latestMonth.MonthlyIncome,
                MoneySpent = moneySpent,
                MoneyLeft = latestMonth.MonthlyIncome - moneySpent,
                TotalInSavings = await context.SavingsPots.SumAsync(s => s.PotAmount),
                TotalInSpendingPots = await context.SpendingPots.SumAsync(s => s.PotAmount)
            };
        }
    }
}
