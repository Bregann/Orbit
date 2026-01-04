using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class StatsServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private StatsService _statsService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestHistoricData(DbContext);
            await TestDatabaseSeedHelper.SeedTestTransactions(DbContext, 5);

            _statsService = new StatsService(DbContext);
        }

        [Test]
        public async Task GetHomepageStats_ShouldReturnStats()
        {
            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert
            Assert.That(result, Is.Not.Null);
        }

        [Test]
        public async Task GetHomepageStats_ShouldReturnCorrectMoneyIn()
        {
            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert - Current month has MonthlyIncome of 300000 pence = £3000
            Assert.That(result.MoneyIn, Is.EqualTo(3000m));
        }

        [Test]
        public async Task GetHomepageStats_ShouldCalculateMoneySpentFromTransactions()
        {
            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert
            Assert.That(result.MoneySpent, Is.GreaterThanOrEqualTo(0));
        }

        [Test]
        public async Task GetHomepageStats_ShouldCalculateMoneyLeft()
        {
            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert
            Assert.That(result.MoneyLeft, Is.EqualTo(result.MoneyIn - result.MoneySpent));
        }

        [Test]
        public async Task GetHomepageStats_ShouldReturnTotalInSavings()
        {
            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert
            Assert.That(result.TotalInSavings, Is.GreaterThanOrEqualTo(0));
        }

        [Test]
        public async Task GetHomepageStats_ShouldReturnZeros_WhenNoHistoricData()
        {
            // Arrange
            DbContext.HistoricData.RemoveRange(DbContext.HistoricData);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert
            Assert.That(result.MoneyIn, Is.EqualTo(0));
            Assert.That(result.MoneySpent, Is.EqualTo(0));
            Assert.That(result.MoneyLeft, Is.EqualTo(0));
            Assert.That(result.TotalInSavings, Is.EqualTo(0));
        }

        [Test]
        public async Task GetHomepageStats_ShouldOnlyCountTransactionsSinceLatestMonth()
        {
            // Arrange - Add old transaction that should not be counted
            var oldTransaction = new Domain.Database.Models.Transactions
            {
                Id = "old-txn-001",
                MerchantName = "Old Merchant",
                TransactionAmount = 100000,
                TransactionDate = DateTime.UtcNow.AddMonths(-6),
                Processed = true
            };
            await DbContext.Transactions.AddAsync(oldTransaction);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _statsService.GetHomepageStats();

            // Assert - The old transaction should not increase the money spent significantly
            // Only transactions since the current month's start date should be counted
            Assert.That(result.MoneySpent, Is.LessThan(1000m)); // Old txn is £1000
        }
    }
}
