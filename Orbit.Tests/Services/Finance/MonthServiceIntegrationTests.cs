using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Finance.Month.Request;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class MonthServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private MonthService _monthService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestSubscriptions(DbContext);

            _monthService = new MonthService(DbContext);
        }

        [Test]
        public async Task AddNewMonth_ShouldCreateNewHistoricMonthEntry()
        {
            // Arrange
            var spendingPots = await DbContext.SpendingPots.ToArrayAsync();
            var savingsPots = await DbContext.SavingsPots.ToArrayAsync();

            var request = new AddNewMonthRequest
            {
                MonthlyIncome = 3000.00m,
                SpendingPots = spendingPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 100.00m
                }).ToArray(),
                SavingsPots = savingsPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 50.00m
                }).ToArray(),
                PotIdsToRollover = []
            };

            // Act
            await _monthService.AddNewMonth(request);

            // Assert
            var newMonth = await DbContext.HistoricData
                .OrderByDescending(h => h.StartDate)
                .FirstAsync();

            Assert.That(newMonth, Is.Not.Null);
            Assert.That(newMonth.MonthlyIncome, Is.EqualTo(300000)); // £3000 in pence
            Assert.That(newMonth.EndDate, Is.Null); // Current month has no end date
        }

        [Test]
        public async Task AddNewMonth_ShouldResetSpendingPotAmounts()
        {
            // Arrange
            var spendingPots = await DbContext.SpendingPots.ToArrayAsync();
            var savingsPots = await DbContext.SavingsPots.ToArrayAsync();

            var request = new AddNewMonthRequest
            {
                MonthlyIncome = 3000.00m,
                SpendingPots = spendingPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 200.00m
                }).ToArray(),
                SavingsPots = savingsPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 50.00m
                }).ToArray(),
                PotIdsToRollover = []
            };

            // Act
            await _monthService.AddNewMonth(request);

            // Assert
            var updatedPots = await DbContext.SpendingPots.ToArrayAsync();
            foreach (var pot in updatedPots)
            {
                Assert.That(pot.PotAmountSpent, Is.EqualTo(0));
                Assert.That(pot.PotAmountLeft, Is.EqualTo(20000)); // £200 in pence
            }
        }

        [Test]
        public async Task AddNewMonth_ShouldRolloverPotAmounts_WhenSpecified()
        {
            // Arrange
            var spendingPot = await DbContext.SpendingPots.FirstAsync();
            var originalAmountLeft = spendingPot.PotAmountLeft;
            var savingsPots = await DbContext.SavingsPots.ToArrayAsync();

            var request = new AddNewMonthRequest
            {
                MonthlyIncome = 3000.00m,
                SpendingPots = new[]
                {
                    new NewMonthPotData { PotId = spendingPot.Id, AmountToAdd = 100.00m }
                }.Concat((await DbContext.SpendingPots.Where(p => p.Id != spendingPot.Id).ToArrayAsync())
                    .Select(p => new NewMonthPotData { PotId = p.Id, AmountToAdd = 100.00m })).ToArray(),
                SavingsPots = savingsPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 50.00m
                }).ToArray(),
                PotIdsToRollover = [spendingPot.Id]
            };

            // Act
            await _monthService.AddNewMonth(request);

            // Assert
            var updatedPot = await DbContext.SpendingPots.FindAsync(spendingPot.Id);
            // Rolled over pot should have original amount + new amount
            Assert.That(updatedPot!.PotAmountLeft, Is.EqualTo(originalAmountLeft + 10000)); // Original + £100
        }

        [Test]
        public async Task AddNewMonth_ShouldUpdateSavingsPotAmounts()
        {
            // Arrange
            var savingsPot = await DbContext.SavingsPots.FirstAsync();
            var originalPotAmount = savingsPot.PotAmount;
            var spendingPots = await DbContext.SpendingPots.ToArrayAsync();

            var request = new AddNewMonthRequest
            {
                MonthlyIncome = 3000.00m,
                SpendingPots = spendingPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 100.00m
                }).ToArray(),
                SavingsPots = new[]
                {
                    new NewMonthPotData { PotId = savingsPot.Id, AmountToAdd = 100.00m }
                },
                PotIdsToRollover = []
            };

            // Act
            await _monthService.AddNewMonth(request);

            // Assert
            var updatedPot = await DbContext.SavingsPots.FindAsync(savingsPot.Id);
            Assert.That(updatedPot!.PotAmount, Is.EqualTo(originalPotAmount + 10000)); // +£100
            Assert.That(updatedPot.AmountToAdd, Is.EqualTo(10000)); // £100
        }

        [Test]
        public async Task AddNewMonth_ShouldArchiveCurrentMonthData_WhenHistoricMonthExists()
        {
            // Arrange - First create an initial month
            var spendingPots = await DbContext.SpendingPots.ToArrayAsync();
            var savingsPots = await DbContext.SavingsPots.ToArrayAsync();

            var initialRequest = new AddNewMonthRequest
            {
                MonthlyIncome = 2500.00m,
                SpendingPots = spendingPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 100.00m
                }).ToArray(),
                SavingsPots = savingsPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 50.00m
                }).ToArray(),
                PotIdsToRollover = []
            };

            await _monthService.AddNewMonth(initialRequest);

            // Set some spending on pots
            var pot = await DbContext.SpendingPots.FirstAsync();
            pot.PotAmountSpent = 5000;
            pot.PotAmountLeft = 5000;
            await DbContext.SaveChangesAsync();

            // Now add a new month
            var newRequest = new AddNewMonthRequest
            {
                MonthlyIncome = 3000.00m,
                SpendingPots = spendingPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 150.00m
                }).ToArray(),
                SavingsPots = savingsPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 75.00m
                }).ToArray(),
                PotIdsToRollover = []
            };

            // Act
            await _monthService.AddNewMonth(newRequest);

            // Assert - Should have archived the previous month
            var completedMonths = await DbContext.HistoricData
                .Where(h => h.EndDate != null)
                .ToArrayAsync();

            Assert.That(completedMonths.Length, Is.GreaterThan(0));
        }

        [Test]
        public async Task AddNewMonth_ShouldCalculateSubscriptionCost()
        {
            // Arrange
            var spendingPots = await DbContext.SpendingPots.ToArrayAsync();
            var savingsPots = await DbContext.SavingsPots.ToArrayAsync();

            var request = new AddNewMonthRequest
            {
                MonthlyIncome = 3000.00m,
                SpendingPots = spendingPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 100.00m
                }).ToArray(),
                SavingsPots = savingsPots.Select(p => new NewMonthPotData
                {
                    PotId = p.Id,
                    AmountToAdd = 50.00m
                }).ToArray(),
                PotIdsToRollover = []
            };

            // Act
            await _monthService.AddNewMonth(request);

            // Assert
            var newMonth = await DbContext.HistoricData
                .OrderByDescending(h => h.StartDate)
                .FirstAsync();

            var expectedSubscriptionCost = await DbContext.Subscriptions.SumAsync(s => s.SubscriptionMonthlyAmount);
            Assert.That(newMonth.SubscriptionCostAmount, Is.EqualTo(expectedSubscriptionCost));
        }
    }
}
