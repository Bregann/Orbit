using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Stats.Responses;
using Orbit.Domain.Interfaces.Api;
using Microsoft.EntityFrameworkCore;

namespace Orbit.Domain.Services
{
    public class StatsService(AppDbContext context) : IStatsService
    {
        public async Task<GetHomepageStatsDto> GetHomepageStats()
        {
            // get the latest month from the historic data
            var latestMonth = await context.HistoricData
                .OrderByDescending(h => h.DateAdded)
                .FirstOrDefaultAsync();

            if (latestMonth == null)
            {
                return new GetHomepageStatsDto
                {
                    MoneyIn = "£0.00",
                    MoneySpent = "£0.00",
                    MoneyLeft = "£0.00",
                    TotalInSavings = "£0.00",
                    TotalInSpendingPots = "£0.00"
                };
            }

            // get all the transactions since the date added of the latest month
            var transactions = await context.Transactions
                .Where(t => t.TransactionDate >= latestMonth.DateAdded)
                .ToListAsync();

            var moneySpent = transactions.Sum(t => t.TransactionAmount);

            return new GetHomepageStatsDto
            {
                MoneyIn = $"£{latestMonth.MonthlyIncome / 100m:0.00}",
                MoneySpent = $"£{moneySpent / 100m:0.00}",
                MoneyLeft = $"£{(latestMonth.MonthlyIncome - moneySpent) / 100m:0.00}",
                TotalInSavings = $"£{await context.SavingsPots.SumAsync(s => s.PotAmount) / 100m:0.00}",
                TotalInSpendingPots = $"£{await context.SpendingPots.SumAsync(s => s.PotAmountLeft) / 100m:0.00}"
            };
        }
    }
}
