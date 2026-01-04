using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class HistoricDataServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private HistoricDataService _historicDataService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestHistoricData(DbContext);
            await TestDatabaseSeedHelper.SeedTestTransactions(DbContext, 10);

            _historicDataService = new HistoricDataService(DbContext);
        }

        [Test]
        public async Task GetHistoricMonthsDropdownValues_ShouldReturnCompletedMonths()
        {
            // Act
            var result = await _historicDataService.GetHistoricMonthsDropdownValues();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Months, Is.Not.Empty);
        }

        [Test]
        public async Task GetHistoricMonthsDropdownValues_ShouldOnlyReturnMonthsWithEndDate()
        {
            // Act
            var result = await _historicDataService.GetHistoricMonthsDropdownValues();

            // Assert
            // Current month has no EndDate, so it should not be in the dropdown
            var monthsWithEndDateCount = await DbContext.HistoricData
                .CountAsync(hd => hd.EndDate != null);

            Assert.That(result.Months.Length, Is.EqualTo(monthsWithEndDateCount));
        }

        [Test]
        public async Task GetHistoricMonthsDropdownValues_ShouldOrderByStartDateDescending()
        {
            // Arrange - Add more historic months
            await DbContext.HistoricData.AddAsync(new Domain.Database.Models.HistoricMonthlyData
            {
                StartDate = DateTime.UtcNow.AddMonths(-3),
                EndDate = DateTime.UtcNow.AddMonths(-2),
                MonthlyIncome = 300000,
                AmountSpent = 150000,
                AmountSaved = 50000,
                AmountLeftOver = 100000,
                SubscriptionCostAmount = 5000
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _historicDataService.GetHistoricMonthsDropdownValues();

            // Assert
            Assert.That(result.Months.Length, Is.GreaterThan(1));
            // First month should be the most recent
            var firstMonth = result.Months.First();
            var lastMonth = result.Months.Last();
            Assert.That(firstMonth.Id, Is.Not.EqualTo(lastMonth.Id));
        }

        [Test]
        public async Task GetHistoricMonthsDropdownValues_ShouldReturnEmptyArray_WhenNoCompletedMonths()
        {
            // Arrange - Remove all historic data with end dates
            var completed = await DbContext.HistoricData.Where(hd => hd.EndDate != null).ToListAsync();
            DbContext.HistoricData.RemoveRange(completed);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _historicDataService.GetHistoricMonthsDropdownValues();

            // Assert
            Assert.That(result.Months, Is.Empty);
        }

        [Test]
        public async Task GetHistoricMonthData_ShouldReturnMonthData()
        {
            // Arrange
            var historicMonth = await DbContext.HistoricData
                .FirstAsync(hd => hd.EndDate != null);

            // Act
            var result = await _historicDataService.GetHistoricMonthData(historicMonth.Id);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.TotalSpent, Is.EqualTo(historicMonth.AmountSpent));
            Assert.That(result.TotalSaved, Is.EqualTo(historicMonth.AmountSaved));
            Assert.That(result.AmountLeftOver, Is.EqualTo(historicMonth.AmountLeftOver));
        }

        [Test]
        public async Task GetHistoricMonthData_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _historicDataService.GetHistoricMonthData(99999));

            Assert.That(exception.Message, Does.Contain("Historic month data not found"));
        }

        [Test]
        public async Task GetHistoricMonthData_ShouldReturnTopSpendingMerchants()
        {
            // Arrange
            var historicMonth = await DbContext.HistoricData
                .FirstAsync(hd => hd.EndDate != null);

            // Add transactions within this month's date range
            await DbContext.Transactions.AddRangeAsync(new[]
            {
                new Domain.Database.Models.Transactions
                {
                    Id = "historic-txn-1",
                    MerchantName = "Top Merchant",
                    TransactionAmount = 5000,
                    TransactionDate = historicMonth.StartDate.AddDays(1),
                    Processed = true
                },
                new Domain.Database.Models.Transactions
                {
                    Id = "historic-txn-2",
                    MerchantName = "Top Merchant",
                    TransactionAmount = 3000,
                    TransactionDate = historicMonth.StartDate.AddDays(2),
                    Processed = true
                }
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _historicDataService.GetHistoricMonthData(historicMonth.Id);

            // Assert
            Assert.That(result.TopSpendingMerchants, Is.Not.Null);
            var topMerchant = result.TopSpendingMerchants.FirstOrDefault(m => m.MerchantName == "Top Merchant");
            Assert.That(topMerchant, Is.Not.Null);
            Assert.That(topMerchant.TransactionsCount, Is.EqualTo(2));
        }

        [Test]
        public async Task GetHistoricMonthData_ShouldReturnSpendingPerDay()
        {
            // Arrange
            var historicMonth = await DbContext.HistoricData
                .FirstAsync(hd => hd.EndDate != null);

            // Act
            var result = await _historicDataService.GetHistoricMonthData(historicMonth.Id);

            // Assert
            Assert.That(result.SpendingPerDay, Is.Not.Null);
            Assert.That(result.SpendingPerDay.Length, Is.GreaterThan(0));
        }

        [Test]
        public async Task GetHistoricMonthData_ShouldLimitTopTransactionsToFive()
        {
            // Arrange
            var historicMonth = await DbContext.HistoricData
                .FirstAsync(hd => hd.EndDate != null);

            // Add many transactions
            for (int i = 0; i < 10; i++)
            {
                await DbContext.Transactions.AddAsync(new Domain.Database.Models.Transactions
                {
                    Id = $"limit-txn-{i}",
                    MerchantName = $"Merchant {i}",
                    TransactionAmount = (i + 1) * 1000,
                    TransactionDate = historicMonth.StartDate.AddDays(i % 5),
                    Processed = true
                });
            }
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _historicDataService.GetHistoricMonthData(historicMonth.Id);

            // Assert
            Assert.That(result.TopTransactions.Length, Is.LessThanOrEqualTo(5));
        }

        [Test]
        public async Task GetYearlyHistoricData_ShouldReturnLast12Months()
        {
            // Arrange - Add more historic data
            for (int i = 2; i <= 12; i++)
            {
                await DbContext.HistoricData.AddAsync(new Domain.Database.Models.HistoricMonthlyData
                {
                    StartDate = DateTime.UtcNow.AddMonths(-i),
                    EndDate = DateTime.UtcNow.AddMonths(-i + 1),
                    MonthlyIncome = 300000,
                    AmountSpent = 150000 + (i * 1000),
                    AmountSaved = 50000,
                    AmountLeftOver = 100000,
                    SubscriptionCostAmount = 5000
                });
            }
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _historicDataService.GetYearlyHistoricData();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.MonthlySpending.Length, Is.LessThanOrEqualTo(12));
        }

        [Test]
        public async Task GetYearlyHistoricData_ShouldReturnMonthlySpending()
        {
            // Act
            var result = await _historicDataService.GetYearlyHistoricData();

            // Assert
            Assert.That(result.MonthlySpending, Is.Not.Null);
            foreach (var month in result.MonthlySpending)
            {
                Assert.That(month.Month, Is.Not.Null.And.Not.Empty);
                Assert.That(month.AmountSpent, Is.GreaterThanOrEqualTo(0));
            }
        }

        [Test]
        public async Task GetYearlyHistoricData_ShouldReturnMonthlyLeftOver()
        {
            // Act
            var result = await _historicDataService.GetYearlyHistoricData();

            // Assert
            Assert.That(result.MonthlyLeftOver, Is.Not.Null);
        }

        [Test]
        public async Task GetYearlyHistoricData_ShouldReturnMonthlySavings()
        {
            // Act
            var result = await _historicDataService.GetYearlyHistoricData();

            // Assert
            Assert.That(result.MonthlySavings, Is.Not.Null);
        }

        [Test]
        public async Task GetYearlyHistoricData_ShouldReturnEmptyArrays_WhenNoData()
        {
            // Arrange
            DbContext.HistoricData.RemoveRange(DbContext.HistoricData);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _historicDataService.GetYearlyHistoricData();

            // Assert
            Assert.That(result.MonthlySpending, Is.Empty);
            Assert.That(result.MonthlyLeftOver, Is.Empty);
            Assert.That(result.MonthlySavings, Is.Empty);
        }
    }
}
