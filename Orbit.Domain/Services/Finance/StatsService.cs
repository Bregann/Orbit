using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Finance.Stats.Responses;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Domain.Services.Finance
{
    public class StatsService(AppDbContext context) : IStatsService
    {
        public async Task<GetHomepageStatsDto> GetHomepageStats()
        {
            // get the latest month from the historic data
            var latestMonth = await context.HistoricData
                .OrderByDescending(h => h.StartDate)
                .FirstOrDefaultAsync();

            if (latestMonth == null)
            {
                return new GetHomepageStatsDto
                {
                    MoneyIn = 0,
                    MoneySpent = 0,
                    MoneyLeft = 0,
                    TotalInSavings = 0,
                };
            }

            // get all the transactions since the date added of the latest month
            var transactions = await context.Transactions
                .Where(t => t.TransactionDate >= latestMonth.StartDate)
                .ToListAsync();

            var moneySpent = transactions.Sum(t => t.TransactionAmount);

            return new GetHomepageStatsDto
            {
                MoneyIn = latestMonth.MonthlyIncome / 100m,
                MoneySpent = moneySpent / 100m,
                MoneyLeft = (latestMonth.MonthlyIncome - moneySpent) / 100m,
                TotalInSavings = await context.SavingsPots.SumAsync(s => s.AmountToAdd) / 100m,
            };
        }
    }
}
