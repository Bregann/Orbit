using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Finance.Month.Request;
using Orbit.Domain.Interfaces.Api.Finance;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Finance
{
    public class MonthService(AppDbContext context) : IMonthService
    {
        public async Task AddNewMonth(AddNewMonthRequest request)
        {
            // get the current historic month from the database
            var currentHistoricMonth = await context.HistoricData
                .OrderByDescending(h => h.StartDate)
                .FirstOrDefaultAsync();

            var spendingPots = await context.SpendingPots.ToArrayAsync();
            var savingsPots = await context.SavingsPots.ToArrayAsync();

            if (currentHistoricMonth != null)
            {
                // calculate the total amount spent in the month
                currentHistoricMonth.AmountSpent = spendingPots.Sum(p => p.PotAmountSpent);
                currentHistoricMonth.AmountLeftOver = spendingPots.Sum(p => p.PotAmountLeft);
                currentHistoricMonth.EndDate = DateTime.UtcNow;
                await context.SaveChangesAsync();

                // Archive spending pots data
                foreach (var pot in spendingPots)
                {
                    var historicSpendingPotData = new HistoricSpendingPotData
                    {
                        PotId = pot.Id,
                        PotAmount = pot.AmountToAdd,
                        PotAmountSpent = pot.PotAmountSpent,
                        PotAmountLeft = pot.PotAmountLeft,
                        HistoricMonthlyDataId = currentHistoricMonth.Id
                    };

                    await context.HistoricSpendingPotData.AddAsync(historicSpendingPotData);
                    await context.SaveChangesAsync();
                }

                // Archive savings pots data
                foreach (var pot in savingsPots)
                {
                    var historicSavingsPotData = new HistoricSavingsPotData
                    {
                        PotId = pot.Id,
                        PotAmount = pot.PotAmount,
                        HistoricMonthlyDataId = currentHistoricMonth.Id,
                        AmountSaved = pot.AmountToAdd
                    };

                    await context.HistoricSavingsPotData.AddAsync(historicSavingsPotData);
                    await context.SaveChangesAsync();
                }
            }

            // reset the pots for the new month
            foreach (var pot in spendingPots)
            {
                // Reset the spending pot's spent amount for the new month
                // there could be a new pot amount from the request so get that
                var potAmountFromRequest = (long)(request.SpendingPots.First(x => x.PotId == pot.Id).AmountToAdd * 100);

                // check if the pot is to be rolled over, if not then set the amount left to 0
                if (!request.PotIdsToRollover.Contains(pot.Id))
                {
                    pot.PotAmountLeft = 0;
                }

                pot.AmountToAdd = potAmountFromRequest;
                pot.PotAmountLeft += potAmountFromRequest;
                pot.PotAmountSpent = 0;

                await context.SaveChangesAsync();
            }

            foreach (var pot in savingsPots)
            {
                // there could be a new pot amount from the request so get that
                var potAmountFromRequest = (long)(request.SavingsPots.First(x => x.PotId == pot.Id).AmountToAdd * 100);
                pot.AmountToAdd = potAmountFromRequest;
                pot.PotAmount += potAmountFromRequest;

                await context.SaveChangesAsync();
            }

            // Create a new historic month entry
            var newHistoricMonth = new HistoricMonthlyData
            {
                StartDate = DateTime.UtcNow,
                MonthlyIncome = (long)(request.MonthlyIncome * 100),
                AmountSaved = savingsPots.Sum(p => p.AmountToAdd),
                AmountSpent = 0, // This will be updated at the end of the month
                AmountLeftOver = 0, // calculated at the end of the month
                SubscriptionCostAmount = context.Subscriptions.Sum(s => s.SubscriptionMonthlyAmount)
            };

            await context.HistoricData.AddAsync(newHistoricMonth);
            await context.SaveChangesAsync();
        }
    }
}
