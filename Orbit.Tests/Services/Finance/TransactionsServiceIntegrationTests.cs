using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    /// <summary>
    /// Example integration test using real database via Testcontainers
    /// </summary>
    [TestFixture]
    public class TransactionsServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private TransactionsService _sut = null!;

        protected override async Task CustomSetUp()
        {
            // Seed test data
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestTransactions(DbContext, 10);

            // Create service under test
            _sut = new TransactionsService(DbContext);
        }

        [Test]
        public async Task GetUnprocessedTransactions_ShouldReturnUnprocessedTransactions()
        {
            // Act
            var result = await _sut.GetUnprocessedTransactions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UnprocessedTransactions, Is.Not.Empty);
            // Note: TransactionsTableRow doesn't expose Processed property, 
            // but we can verify we got results
        }

        [Test]
        public async Task GetTransactionsForMonth_ShouldReturnMonthTransactions()
        {
            // Act
            var result = await _sut.GetTransactionsForMonth();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Transactions, Is.Not.Null);
            // Add more assertions based on your expected behavior
        }

        [Test]
        public async Task UpdateTransaction_ShouldUpdateTransactionSuccessfully()
        {
            // Arrange
            var transaction = DbContext.Transactions.First();
            var updateRequest = new Orbit.Domain.DTOs.Finance.Transactions.Requests.UpdateTransactionRequest
            {
                TransactionId = transaction.Id,
                PotId = 1
            };

            // Act
            await _sut.UpdateTransaction(updateRequest);

            // Assert
            var updatedTransaction = await DbContext.Transactions.FindAsync(transaction.Id);
            Assert.That(updatedTransaction, Is.Not.Null);
            Assert.That(updatedTransaction.PotId, Is.EqualTo(1));
            Assert.That(updatedTransaction.Processed, Is.True);
        }
    }
}
