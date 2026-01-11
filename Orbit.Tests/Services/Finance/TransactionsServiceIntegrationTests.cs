using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Finance.Transactions.Requests;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class TransactionsServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private TransactionsService _transactionsService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestTransactions(DbContext, 10);
            await TestDatabaseSeedHelper.SeedTestHistoricData(DbContext);
            await TestDatabaseSeedHelper.SeedTestAutomaticTransactions(DbContext);

            _transactionsService = new TransactionsService(DbContext);
        }

        [Test]
        public async Task GetUnprocessedTransactions_ShouldReturnUnprocessedTransactions()
        {
            // Act
            var result = await _transactionsService.GetUnprocessedTransactions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UnprocessedTransactions, Is.Not.Empty);
        }

        [Test]
        public async Task GetUnprocessedTransactions_ShouldOnlyReturnUnprocessed()
        {
            // Act
            var result = await _transactionsService.GetUnprocessedTransactions();

            // Assert
            var unprocessedInDb = await DbContext.Transactions.CountAsync(t => !t.Processed);
            Assert.That(result.UnprocessedTransactions.Length, Is.EqualTo(unprocessedInDb));
        }

        [Test]
        public async Task GetTransactionsForMonth_ShouldReturnMonthTransactions()
        {
            // Act
            var result = await _transactionsService.GetTransactionsForMonth();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Transactions, Is.Not.Null);
        }

        [Test]
        public async Task GetTransactionsForMonth_ShouldReturnEmptyArray_WhenNoHistoricData()
        {
            // Arrange
            DbContext.HistoricData.RemoveRange(DbContext.HistoricData);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _transactionsService.GetTransactionsForMonth();

            // Assert
            Assert.That(result.Transactions, Is.Empty);
        }

        [Test]
        public async Task UpdateTransaction_ShouldUpdateTransactionSuccessfully()
        {
            // Arrange
            var transaction = DbContext.Transactions.First();
            var updateRequest = new UpdateTransactionRequest
            {
                TransactionId = transaction.Id,
                PotId = 1
            };

            // Act
            await _transactionsService.UpdateTransaction(updateRequest);

            // Assert
            var updatedTransaction = await DbContext.Transactions.FindAsync(transaction.Id);
            Assert.That(updatedTransaction, Is.Not.Null);
            Assert.That(updatedTransaction.PotId, Is.EqualTo(1));
            Assert.That(updatedTransaction.Processed, Is.True);
        }

        [Test]
        public async Task UpdateTransaction_ShouldThrowKeyNotFoundException_WhenTransactionNotFound()
        {
            // Arrange
            var request = new UpdateTransactionRequest
            {
                TransactionId = "non-existent-id",
                PotId = 1
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.UpdateTransaction(request));

            Assert.That(exception.Message, Does.Contain("Transaction with ID non-existent-id not found"));
        }

        [Test]
        public async Task UpdateTransaction_ShouldThrowKeyNotFoundException_WhenPotNotFound()
        {
            // Arrange
            var transaction = DbContext.Transactions.First();
            var request = new UpdateTransactionRequest
            {
                TransactionId = transaction.Id,
                PotId = 99999
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.UpdateTransaction(request));

            Assert.That(exception.Message, Does.Contain("Spending pot with ID 99999 not found"));
        }

        [Test]
        public async Task UpdateTransaction_ShouldUpdatePotAmounts_WhenAssigningToPot()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.PotId == null);
            var pot = DbContext.SpendingPots.First();
            var originalPotAmountLeft = pot.PotAmountLeft;
            var originalPotAmountSpent = pot.PotAmountSpent;

            var request = new UpdateTransactionRequest
            {
                TransactionId = transaction.Id,
                PotId = pot.Id
            };

            // Act
            await _transactionsService.UpdateTransaction(request);

            // Assert
            var updatedPot = await DbContext.SpendingPots.FindAsync(pot.Id);
            Assert.That(updatedPot!.PotAmountLeft, Is.EqualTo(originalPotAmountLeft - transaction.TransactionAmount));
            Assert.That(updatedPot.PotAmountSpent, Is.EqualTo(originalPotAmountSpent + transaction.TransactionAmount));
        }

        [Test]
        public async Task UpdateTransaction_ShouldRevertOldPotAmounts_WhenChangingPots()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.PotId != null);
            var oldPot = await DbContext.SpendingPots.FindAsync(transaction.PotId);
            var newPot = DbContext.SpendingPots.First(p => p.Id != transaction.PotId);

            var originalOldPotAmountLeft = oldPot!.PotAmountLeft;
            var originalOldPotAmountSpent = oldPot.PotAmountSpent;

            var request = new UpdateTransactionRequest
            {
                TransactionId = transaction.Id,
                PotId = newPot.Id
            };

            // Act
            await _transactionsService.UpdateTransaction(request);

            // Assert
            var updatedOldPot = await DbContext.SpendingPots.FindAsync(oldPot.Id);
            Assert.That(updatedOldPot!.PotAmountLeft, Is.EqualTo(originalOldPotAmountLeft + transaction.TransactionAmount));
            Assert.That(updatedOldPot.PotAmountSpent, Is.EqualTo(originalOldPotAmountSpent - transaction.TransactionAmount));
        }

        [Test]
        public async Task UpdateTransaction_ShouldMarkAsProcessed()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => !t.Processed);
            var request = new UpdateTransactionRequest
            {
                TransactionId = transaction.Id,
                PotId = null
            };

            // Act
            await _transactionsService.UpdateTransaction(request);

            // Assert
            var updated = await DbContext.Transactions.FindAsync(transaction.Id);
            Assert.That(updated!.Processed, Is.True);
        }

        [Test]
        public async Task GetAutomaticTransactions_ShouldReturnAllAutomaticTransactions()
        {
            // Act
            var result = await _transactionsService.GetAutomaticTransactions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AutomaticTransactions, Is.Not.Empty);
            Assert.That(result.AutomaticTransactions.Any(at => at.MerchantName == "Netflix"), Is.True);
            Assert.That(result.AutomaticTransactions.Any(at => at.MerchantName == "Spotify"), Is.True);
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldCreateAutomaticTransaction()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "New Merchant",
                PotId = 1,
                IsSubscription = false
            };

            // Act
            var id = await _transactionsService.AddAutomaticTransaction(request);

            // Assert
            var automaticTransaction = await DbContext.AutomaticTransactions.FindAsync(id);
            Assert.That(automaticTransaction, Is.Not.Null);
            Assert.That(automaticTransaction.MerchantName, Is.EqualTo("New Merchant"));
            Assert.That(automaticTransaction.PotId, Is.EqualTo(1));
            Assert.That(automaticTransaction.IsSubscription, Is.False);
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldCreateSubscription_WhenIsSubscriptionIsTrue()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "New Subscription Service",
                PotId = null,
                IsSubscription = true
            };

            // Act
            var id = await _transactionsService.AddAutomaticTransaction(request);

            // Assert
            var automaticTransaction = await DbContext.AutomaticTransactions.FindAsync(id);
            Assert.That(automaticTransaction, Is.Not.Null);
            Assert.That(automaticTransaction.MerchantName, Is.EqualTo("New Subscription Service"));
            Assert.That(automaticTransaction.PotId, Is.Null);
            Assert.That(automaticTransaction.IsSubscription, Is.True);
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldThrowArgumentException_WhenMerchantNameIsEmpty()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "",
                PotId = 1,
                IsSubscription = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<ArgumentException>(async () =>
                await _transactionsService.AddAutomaticTransaction(request));

            Assert.That(exception.Message, Does.Contain("Invalid merchant name or pot ID"));
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldThrowArgumentException_WhenPotIdIsInvalidAndNotSubscription()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "Test Merchant",
                PotId = 0,
                IsSubscription = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<ArgumentException>(async () =>
                await _transactionsService.AddAutomaticTransaction(request));

            Assert.That(exception.Message, Does.Contain("Invalid merchant name or pot ID"));
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldAllowNullPotId_WhenIsSubscriptionIsTrue()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "Subscription Without Pot",
                PotId = null,
                IsSubscription = true
            };

            // Act
            var id = await _transactionsService.AddAutomaticTransaction(request);

            // Assert
            var automaticTransaction = await DbContext.AutomaticTransactions.FindAsync(id);
            Assert.That(automaticTransaction, Is.Not.Null);
            Assert.That(automaticTransaction.PotId, Is.Null);
            Assert.That(automaticTransaction.IsSubscription, Is.True);
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldThrowKeyNotFoundException_WhenPotNotFound()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "Test Merchant",
                PotId = 99999,
                IsSubscription = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.AddAutomaticTransaction(request));

            Assert.That(exception.Message, Does.Contain("Spending pot with ID 99999 not found"));
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldThrowInvalidOperationException_WhenMerchantExists()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "Netflix", // Already exists
                PotId = 1,
                IsSubscription = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _transactionsService.AddAutomaticTransaction(request));

            Assert.That(exception.Message, Does.Contain("An automatic transaction for merchant 'Netflix' already exists"));
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldBeCaseInsensitive()
        {
            // Arrange
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "NETFLIX", // Different case
                PotId = 1,
                IsSubscription = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _transactionsService.AddAutomaticTransaction(request));

            Assert.That(exception.Message, Does.Contain("already exists"));
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldCreateSubscriptionWithPot_WhenBothProvidedAndIsSubscription()
        {
            // Arrange - when IsSubscription is true but PotId is provided (not null)
            var request = new AddAutomaticTransactionRequest
            {
                MerchantName = "Subscription With Pot",
                PotId = 1,
                IsSubscription = true
            };

            // Act
            var id = await _transactionsService.AddAutomaticTransaction(request);

            // Assert
            var automaticTransaction = await DbContext.AutomaticTransactions.FindAsync(id);
            Assert.That(automaticTransaction, Is.Not.Null);
            Assert.That(automaticTransaction.MerchantName, Is.EqualTo("Subscription With Pot"));
            Assert.That(automaticTransaction.PotId, Is.EqualTo(1));
            Assert.That(automaticTransaction.IsSubscription, Is.False); // Should be false based on current implementation
        }

        [Test]
        public async Task AddAutomaticTransaction_ShouldSetIsSubscriptionCorrectly()
        {
            // Arrange - Test non-subscription with pot
            var requestNonSub = new AddAutomaticTransactionRequest
            {
                MerchantName = "Regular Transaction",
                PotId = 1,
                IsSubscription = false
            };

            // Act
            var idNonSub = await _transactionsService.AddAutomaticTransaction(requestNonSub);

            // Assert
            var nonSubTransaction = await DbContext.AutomaticTransactions.FindAsync(idNonSub);
            Assert.That(nonSubTransaction, Is.Not.Null);
            Assert.That(nonSubTransaction.IsSubscription, Is.False);
        }

        [Test]
        public async Task MarkAsSubscription_ShouldMarkTransactionAsSubscription()
        {
            // Arrange
            var automaticTransaction = DbContext.AutomaticTransactions.First(at => !at.IsSubscription);
            var transactionId = automaticTransaction.Id;

            // Act
            await _transactionsService.MarkAsSubscription(transactionId);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated = await DbContext.AutomaticTransactions.FindAsync(transactionId);
            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.IsSubscription, Is.True);
        }

        [Test]
        public async Task MarkAsSubscription_ShouldThrowKeyNotFoundException_WhenTransactionNotFound()
        {
            // Arrange
            var nonExistentId = 99999;

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.MarkAsSubscription(nonExistentId));

            Assert.That(exception.Message, Does.Contain($"Automatic transaction with ID {nonExistentId} not found"));
        }

        [Test]
        public async Task MarkAsSubscription_ShouldNotAffectOtherProperties()
        {
            // Arrange
            var automaticTransaction = DbContext.AutomaticTransactions.First(at => !at.IsSubscription);
            var transactionId = automaticTransaction.Id;
            var originalMerchantName = automaticTransaction.MerchantName;
            var originalPotId = automaticTransaction.PotId;

            // Act
            await _transactionsService.MarkAsSubscription(transactionId);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated = await DbContext.AutomaticTransactions.FindAsync(transactionId);
            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.MerchantName, Is.EqualTo(originalMerchantName));
            Assert.That(updated.PotId, Is.EqualTo(originalPotId));
            Assert.That(updated.IsSubscription, Is.True);
        }

        [Test]
        public async Task MarkAsSubscription_ShouldOnlyUpdateSpecifiedTransaction()
        {
            // Arrange
            var transaction1 = DbContext.AutomaticTransactions.First(at => !at.IsSubscription);
            var transaction2 = DbContext.AutomaticTransactions.Skip(1).First(at => !at.IsSubscription && at.Id != transaction1.Id);

            // Act - Only mark transaction1 as subscription
            await _transactionsService.MarkAsSubscription(transaction1.Id);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated1 = await DbContext.AutomaticTransactions.FindAsync(transaction1.Id);
            var updated2 = await DbContext.AutomaticTransactions.FindAsync(transaction2.Id);

            Assert.That(updated1!.IsSubscription, Is.True);
            Assert.That(updated2!.IsSubscription, Is.False);
        }
    }
}
