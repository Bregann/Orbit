using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Finance.HistoricData;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Domain.Services.Finance
{
    public class HistoricDataService(AppDbContext context) : IHistoricDataService
    {
        public async Task<GetHistoricMonthsDropdownValuesDto> GetHistoricMonthsDropdownValues()
        {
            var months = await context.HistoricData
                .Where(hd => hd.EndDate != null)
                .OrderByDescending(hd => hd.StartDate)
                .Select(hd => new HistoricMonthDropdownValueDto
                {
                    Id = hd.Id,
                    DisplayName = hd.StartDate.ToString("MMMM yyyy")
                })
                .ToArrayAsync();

            return new GetHistoricMonthsDropdownValuesDto
            {
                Months = months
            };
        }

        public async Task<GetHistoricMonthDataDto> GetHistoricMonthData(int monthId)
        {
            var historicData = await context.HistoricData
                .Where(hd => hd.Id == monthId)
                .FirstOrDefaultAsync();

            if (historicData == null)
            {
                throw new KeyNotFoundException("Historic month data not found.");
            }

            var potSpendingBreakdown = new MonthlySpendingDataBreakdown
            {
                PotSpendings = historicData.HistoricPotData.Select(ps => new PotSpendingData
                {
                    PotName = ps.Pot.PotName,
                    AmountSpent = ps.PotAmountSpent / 100m,
                    PercentageOfTotalSpent = historicData.AmountSpent == 0 ? 0 :
                        ps.PotAmountSpent / (decimal)historicData.AmountSpent * 100
                }).ToArray()
            };

            var transactions = await context.Transactions
                .Where(t => t.TransactionDate >= historicData.StartDate && t.TransactionDate <= historicData.EndDate)
                .ToArrayAsync();

            var topSpendingMerchants = transactions
                .GroupBy(t => t.MerchantName)
                .Select(g => new TopSpendingMerchantsData
                {
                    MerchantName = g.Key,
                    AmountSpent = g.Sum(t => t.TransactionAmount / 100m),
                    TransactionsCount = g.Count()
                })
                .OrderByDescending(m => m.AmountSpent)
                .ToArray();

            var topTransactions = transactions
                .OrderByDescending(t => t.TransactionAmount)
                .Take(5)
                .Select(t => new TopTransactionsData
                {
                    MerchantName = t.MerchantName,
                    AmountSpent = t.TransactionAmount / 100m,
                    TransactionDate = t.TransactionDate.ToString("yyyy-MM-dd"),
                    PotName = t.Pot != null ? t.Pot.PotName : null
                })
                .ToArray();

            var spendingPerDay = new List<SpendingPerDayData>();

            for (var date = historicData.StartDate; date <= historicData.EndDate; date = date.AddDays(1))
            {
                var dailySpending = transactions
                    .Where(t => t.TransactionDate.Date == date.Date)
                    .Sum(t => t.TransactionAmount / 100m);

                spendingPerDay.Add(new SpendingPerDayData
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    AmountSpent = dailySpending
                });
            }

            return new GetHistoricMonthDataDto
            {
                TotalSpent = historicData.AmountSpent / 100m,
                TotalSaved = historicData.AmountSaved / 100m,
                AmountLeftOver = historicData.AmountLeftOver / 100m,
                SpendingDataBreakdown = potSpendingBreakdown,
                TopSpendingMerchants = topSpendingMerchants.Take(5).ToArray(),
                TopTransactions = topTransactions,
                SpendingPerDay = spendingPerDay.ToArray()
            };
        }

        public async Task<GetYearlyHistoricDataDto> GetYearlyHistoricData()
        {
            var last12Data = await context.HistoricData
                .OrderByDescending(hd => hd.StartDate)
                .Take(12)
                .OrderBy(hd => hd.StartDate)
                .ToArrayAsync();

            return new GetYearlyHistoricDataDto
            {
                MonthlySpending = last12Data.Select(hd => new MonthlySpendingData
                {
                    Month = hd.StartDate.ToString("MMMM"),
                    AmountSpent = hd.AmountSpent / 100m
                }).ToArray(),
                MonthlyLeftOver = last12Data.Select(hd => new MonthlyLeftOverData
                {
                    Month = hd.StartDate.ToString("MMMM"),
                    AmountLeftOver = hd.AmountLeftOver / 100m
                }).ToArray(),
                MonthlySavings = last12Data.Select(hd => new MonthlySavingsData
                {
                    Month = hd.StartDate.ToString("MMMM"),
                    AmountSaved = hd.AmountSaved / 100m
                }).ToArray(),
                AmountSpentPerPot = last12Data.SelectMany(hd => (hd.HistoricPotData ?? []).Select(pd => new AmountSpentPerPotData
                {
                    Month = hd.StartDate.ToString("MMMM"),
                    PotName = pd.Pot.PotName,
                    TotalAmountSpent = pd.PotAmountSpent / 100m
                })).ToArray(),
                AmountSavedPerPot = last12Data.SelectMany(hd => (hd.HistoricSavingsPotData ?? []).Select(pd => new AmountSavedPerPotData
                {
                    Month = hd.StartDate.ToString("MMMM"),
                    PotName = pd.Pot.PotName,
                    TotalAmountSaved = pd.AmountSaved / 100m
                })).ToArray()
            };
        }
    }
}
