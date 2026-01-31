using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Finance.Transactions.Requests;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;
using Task = System.Threading.Tasks.Task;

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
            Assert.That(automaticTransaction.IsSubscription, Is.True); // Explicit IsSubscription=true should be respected even when PotId is provided
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
            var transaction = DbContext.Transactions.First(t => !t.IsSubscriptionPayment);

            // Act
            await _transactionsService.MarkAsSubscription(transaction.Id);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated = await DbContext.Transactions.FindAsync(transaction.Id);
            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.IsSubscriptionPayment, Is.True);
        }

        [Test]
        public async Task MarkAsSubscription_ShouldThrowKeyNotFoundException_WhenTransactionNotFound()
        {
            // Arrange
            var nonExistentId = "non-existent-txn-id";

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.MarkAsSubscription(nonExistentId));

            Assert.That(exception.Message, Does.Contain($"Transaction with ID {nonExistentId} not found"));
        }

        [Test]
        public async Task MarkAsSubscription_ShouldNotAffectOtherProperties()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => !t.IsSubscriptionPayment);
            var originalMerchantName = transaction.MerchantName;
            var originalPotId = transaction.PotId;
            var originalProcessed = transaction.Processed;

            // Act
            await _transactionsService.MarkAsSubscription(transaction.Id);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated = await DbContext.Transactions.FindAsync(transaction.Id);
            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.MerchantName, Is.EqualTo(originalMerchantName));
            Assert.That(updated.PotId, Is.EqualTo(originalPotId));
            Assert.That(updated.Processed, Is.EqualTo(originalProcessed));
            Assert.That(updated.IsSubscriptionPayment, Is.True);
        }

        [Test]
        public async Task MarkAsSubscription_ShouldOnlyUpdateSpecifiedTransaction()
        {
            // Arrange
            var nonSubscriptionTransactions = DbContext.Transactions
                .Where(t => !t.IsSubscriptionPayment)
                .Take(2)
                .ToList();

            if (nonSubscriptionTransactions.Count < 2)
            {
                Assert.Inconclusive("Test requires at least two non-subscription transactions in the database.");
            }

            var transaction1 = nonSubscriptionTransactions[0];
            var transaction2 = nonSubscriptionTransactions[1];

            // Act - Only mark transaction1 as subscription
            await _transactionsService.MarkAsSubscription(transaction1.Id);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var updated1 = await DbContext.Transactions.FindAsync(transaction1.Id);
            var updated2 = await DbContext.Transactions.FindAsync(transaction2.Id);

            Assert.That(updated1!.IsSubscriptionPayment, Is.True);
            Assert.That(updated2!.IsSubscriptionPayment, Is.False);
        }

        [Test]
        public async Task SplitTransaction_ShouldThrowKeyNotFoundException_WhenTransactionNotFound()
        {
            // Arrange
            var request = new SplitTransactionRequest
            {
                TransactionId = "non-existent-id",
                Splits = [
                    new TransactionSplit { Id = "1", PotId = 1, Amount = 1000 }
                ]
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.SplitTransaction(request));

            Assert.That(exception.Message, Does.Contain("Transaction with ID non-existent-id not found"));
        }

        [Test]
        public async Task SplitTransaction_ShouldThrowArgumentException_WhenSplitAmountsDontMatchOriginal()
        {
            // Arrange
            var transaction = DbContext.Transactions.First();
            var request = new SplitTransactionRequest
            {
                TransactionId = transaction.Id,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = 1, Amount = 500 },
                    new TransactionSplit { Id = "2", PotId = 2, Amount = 300 }
                ]
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<ArgumentException>(async () =>
                await _transactionsService.SplitTransaction(request));

            Assert.That(exception.Message, Does.Contain("must equal the original transaction amount"));
        }

        [Test]
        public async Task SplitTransaction_ShouldThrowKeyNotFoundException_WhenPotNotFound()
        {
            // Arrange
            var transaction = DbContext.Transactions.First();
            var request = new SplitTransactionRequest
            {
                TransactionId = transaction.Id,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = 99999, Amount = transaction.TransactionAmount }
                ]
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _transactionsService.SplitTransaction(request));

            Assert.That(exception.Message, Does.Contain("Spending pot with ID 99999 not found"));
        }

        [Test]
        public async Task SplitTransaction_ShouldSetTransactionTo0p_WhenAllSplitsAreDiscarded()
        {
            // Arrange
            var transaction = DbContext.Transactions.First();
            var transactionId = transaction.Id;
            var request = new SplitTransactionRequest
            {
                TransactionId = transactionId,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = -1, Amount = transaction.TransactionAmount }
                ]
            };

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert
            var updatedTransaction = await DbContext.Transactions.FindAsync(transactionId);
            Assert.That(updatedTransaction, Is.Not.Null);
            Assert.That(updatedTransaction.TransactionAmount, Is.EqualTo(0));
            Assert.That(updatedTransaction.Processed, Is.True);
        }

        [Test]
        public async Task SplitTransaction_ShouldUpdateOriginalTransaction_WhenOnlyOneSplitIsValid()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.PotId == null);
            var transactionId = transaction.Id;
            var originalAmount = transaction.TransactionAmount;
            var pot = DbContext.SpendingPots.First();
            var originalPotAmountLeft = pot.PotAmountLeft;
            var originalPotAmountSpent = pot.PotAmountSpent;

            var request = new SplitTransactionRequest
            {
                TransactionId = transactionId,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = pot.Id, Amount = 1000 },
                    new TransactionSplit { Id = "2", PotId = -1, Amount = originalAmount - 1000 }
                ]
            };

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert
            var updatedTransaction = await DbContext.Transactions.FindAsync(transactionId);
            Assert.That(updatedTransaction, Is.Not.Null);
            Assert.That(updatedTransaction.TransactionAmount, Is.EqualTo(1000));
            Assert.That(updatedTransaction.PotId, Is.EqualTo(pot.Id));
            Assert.That(updatedTransaction.Processed, Is.True);

            // Verify no additional transactions were created
            var transactionCount = await DbContext.Transactions
                .CountAsync(t => t.Id == transactionId || t.Id.StartsWith($"{transactionId}-"));
            Assert.That(transactionCount, Is.EqualTo(1));

            // Verify pot amounts
            DbContext.ChangeTracker.Clear();
            var updatedPot = await DbContext.SpendingPots.FindAsync(pot.Id);
            Assert.That(updatedPot!.PotAmountLeft, Is.EqualTo(originalPotAmountLeft - 1000));
            Assert.That(updatedPot.PotAmountSpent, Is.EqualTo(originalPotAmountSpent + 1000));
        }

        [Test]
        public async Task SplitTransaction_ShouldCreateMultipleTransactions_WhenMultipleSplitsAreValid()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.TransactionAmount >= 3000 && !t.Processed);
            var transactionId = transaction.Id;
            var pot1 = DbContext.SpendingPots.First();
            var pot2 = DbContext.SpendingPots.Skip(1).First();
            var pot3 = DbContext.SpendingPots.Skip(2).First();

            var originalPot1AmountLeft = pot1.PotAmountLeft;
            var originalPot1AmountSpent = pot1.PotAmountSpent;
            var originalPot2AmountLeft = pot2.PotAmountLeft;
            var originalPot2AmountSpent = pot2.PotAmountSpent;
            var originalPot3AmountLeft = pot3.PotAmountLeft;
            var originalPot3AmountSpent = pot3.PotAmountSpent;

            var request = new SplitTransactionRequest
            {
                TransactionId = transactionId,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = pot1.Id, Amount = 1000 },
                    new TransactionSplit { Id = "2", PotId = pot2.Id, Amount = 500 },
                    new TransactionSplit { Id = "3", PotId = pot3.Id, Amount = transaction.TransactionAmount - 1500 }
                ]
            };

            var transaction3ExpectedAmount = transaction.TransactionAmount - 1500;

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert - Original transaction should be processed and set to 0
            var originalTransaction = await DbContext.Transactions.FindAsync(transactionId);
            Assert.That(originalTransaction, Is.Not.Null);
            Assert.That(originalTransaction.Processed, Is.True);
            Assert.That(originalTransaction.TransactionAmount, Is.Zero);

            // Verify new transactions were created
            var newTransaction1 = await DbContext.Transactions.FindAsync($"{transactionId}-1");
            var newTransaction2 = await DbContext.Transactions.FindAsync($"{transactionId}-2");
            var newTransaction3 = await DbContext.Transactions.FindAsync($"{transactionId}-3");

            Assert.That(newTransaction1, Is.Not.Null);
            Assert.That(newTransaction1!.TransactionAmount, Is.EqualTo(1000));
            Assert.That(newTransaction1.PotId, Is.EqualTo(pot1.Id));
            Assert.That(newTransaction1.Processed, Is.True);
            Assert.That(newTransaction1.MerchantName, Is.EqualTo(transaction.MerchantName));
            Assert.That(newTransaction1.TransactionDate, Is.EqualTo(transaction.TransactionDate));

            Assert.That(newTransaction2, Is.Not.Null);
            Assert.That(newTransaction2!.TransactionAmount, Is.EqualTo(500));
            Assert.That(newTransaction2.PotId, Is.EqualTo(pot2.Id));

            Assert.That(newTransaction3, Is.Not.Null);
            Assert.That(newTransaction3!.TransactionAmount, Is.EqualTo(transaction3ExpectedAmount));
            Assert.That(newTransaction3.PotId, Is.EqualTo(pot3.Id));

            // Verify pot amounts
            DbContext.ChangeTracker.Clear();
            var updatedPot1 = await DbContext.SpendingPots.FindAsync(pot1.Id);
            var updatedPot2 = await DbContext.SpendingPots.FindAsync(pot2.Id);
            var updatedPot3 = await DbContext.SpendingPots.FindAsync(pot3.Id);

            Assert.That(updatedPot1!.PotAmountLeft, Is.EqualTo(originalPot1AmountLeft - 1000));
            Assert.That(updatedPot1.PotAmountSpent, Is.EqualTo(originalPot1AmountSpent + 1000));

            Assert.That(updatedPot2!.PotAmountLeft, Is.EqualTo(originalPot2AmountLeft - 500));
            Assert.That(updatedPot2.PotAmountSpent, Is.EqualTo(originalPot2AmountSpent + 500));

            Assert.That(updatedPot3!.PotAmountLeft, Is.EqualTo(originalPot3AmountLeft - transaction3ExpectedAmount));
            Assert.That(updatedPot3.PotAmountSpent, Is.EqualTo(originalPot3AmountSpent + transaction3ExpectedAmount));
        }

        [Test]
        public async Task SplitTransaction_ShouldRevertOriginalPotAmounts_WhenTransactionHadPotAssigned()
        {
            // Arrange
            var pot1 = DbContext.SpendingPots.First();
            var pot2 = DbContext.SpendingPots.Skip(1).First();

            // Create a transaction with a pot assigned
            var transaction = new Transactions
            {
                Id = "test-split-txn-with-pot",
                MerchantName = "Test Merchant",
                TransactionAmount = 2000,
                TransactionDate = DateTimeOffset.UtcNow,
                Processed = true,
                PotId = pot1.Id,
                IsSubscriptionPayment = false
            };

            DbContext.Transactions.Add(transaction);
            pot1.PotAmountSpent += 2000;
            pot1.PotAmountLeft -= 2000;
            await DbContext.SaveChangesAsync();

            var originalPot1AmountLeft = pot1.PotAmountLeft;
            var originalPot1AmountSpent = pot1.PotAmountSpent;
            var originalPot2AmountLeft = pot2.PotAmountLeft;
            var originalPot2AmountSpent = pot2.PotAmountSpent;

            var request = new SplitTransactionRequest
            {
                TransactionId = transaction.Id,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = pot2.Id, Amount = 2000 }
                ]
            };

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert - Original pot should have amounts reverted
            DbContext.ChangeTracker.Clear();
            var updatedPot1 = await DbContext.SpendingPots.FindAsync(pot1.Id);
            var updatedPot2 = await DbContext.SpendingPots.FindAsync(pot2.Id);

            Assert.That(updatedPot1!.PotAmountLeft, Is.EqualTo(originalPot1AmountLeft + 2000));
            Assert.That(updatedPot1.PotAmountSpent, Is.EqualTo(originalPot1AmountSpent - 2000));

            Assert.That(updatedPot2!.PotAmountLeft, Is.EqualTo(originalPot2AmountLeft - 2000));
            Assert.That(updatedPot2.PotAmountSpent, Is.EqualTo(originalPot2AmountSpent + 2000));
        }

        [Test]
        public async Task SplitTransaction_ShouldPreserveTransactionProperties()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.TransactionAmount >= 2000);
            var transactionId = transaction.Id;
            var originalMerchantName = transaction.MerchantName;
            var originalTransactionDate = transaction.TransactionDate;
            var originalImgUrl = transaction.ImgUrl;
            var originalIsSubscriptionPayment = transaction.IsSubscriptionPayment;

            var pot1 = DbContext.SpendingPots.First();
            var pot2 = DbContext.SpendingPots.Skip(1).First();

            var request = new SplitTransactionRequest
            {
                TransactionId = transactionId,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = pot1.Id, Amount = 1000 },
                    new TransactionSplit { Id = "2", PotId = pot2.Id, Amount = transaction.TransactionAmount - 1000 }
                ]
            };

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert
            var newTransaction1 = await DbContext.Transactions.FindAsync($"{transactionId}-1");
            var newTransaction2 = await DbContext.Transactions.FindAsync($"{transactionId}-2");

            Assert.That(newTransaction1!.MerchantName, Is.EqualTo(originalMerchantName));
            Assert.That(newTransaction1.TransactionDate, Is.EqualTo(originalTransactionDate));
            Assert.That(newTransaction1.ImgUrl, Is.EqualTo(originalImgUrl));
            Assert.That(newTransaction1.IsSubscriptionPayment, Is.EqualTo(originalIsSubscriptionPayment));

            Assert.That(newTransaction2!.MerchantName, Is.EqualTo(originalMerchantName));
            Assert.That(newTransaction2.TransactionDate, Is.EqualTo(originalTransactionDate));
            Assert.That(newTransaction2.ImgUrl, Is.EqualTo(originalImgUrl));
            Assert.That(newTransaction2.IsSubscriptionPayment, Is.EqualTo(originalIsSubscriptionPayment));
        }

        [Test]
        public async Task SplitTransaction_ShouldHandleMixedValidAndDiscardedSplits()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.TransactionAmount >= 3000);
            var transactionId = transaction.Id;
            var pot1 = DbContext.SpendingPots.First();
            var pot2 = DbContext.SpendingPots.Skip(1).First();

            var request = new SplitTransactionRequest
            {
                TransactionId = transactionId,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = pot1.Id, Amount = 1000 },
                    new TransactionSplit { Id = "2", PotId = -1, Amount = 500 },
                    new TransactionSplit { Id = "3", PotId = pot2.Id, Amount = transaction.TransactionAmount - 1500 }
                ]
            };

            var transaction2ExpectedAmount = transaction.TransactionAmount - 1500;

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert - Original transaction should be processed and set to 0
            var originalTransaction = await DbContext.Transactions.FindAsync(transactionId);
            Assert.That(originalTransaction, Is.Not.Null);
            Assert.That(originalTransaction.Processed, Is.True);
            Assert.That(originalTransaction.TransactionAmount, Is.Zero);

            // Only 2 new transactions should be created (discarded split not created)
            var newTransaction1 = await DbContext.Transactions.FindAsync($"{transactionId}-1");
            var newTransaction2 = await DbContext.Transactions.FindAsync($"{transactionId}-2");
            var newTransaction3 = await DbContext.Transactions.FindAsync($"{transactionId}-3");

            Assert.That(newTransaction1, Is.Not.Null);
            Assert.That(newTransaction1!.TransactionAmount, Is.EqualTo(1000));
            Assert.That(newTransaction1.PotId, Is.EqualTo(pot1.Id));

            Assert.That(newTransaction2, Is.Not.Null);
            Assert.That(newTransaction2!.TransactionAmount, Is.EqualTo(transaction2ExpectedAmount));
            Assert.That(newTransaction2.PotId, Is.EqualTo(pot2.Id));

            Assert.That(newTransaction3, Is.Null); // Third split is not created (only 2 valid splits)
        }

        [Test]
        public async Task SplitTransaction_ShouldMarkAllNewTransactionsAsProcessed()
        {
            // Arrange
            var transaction = DbContext.Transactions.First(t => t.TransactionAmount >= 2000);
            var transactionId = transaction.Id;
            var pot1 = DbContext.SpendingPots.First();
            var pot2 = DbContext.SpendingPots.Skip(1).First();

            var request = new SplitTransactionRequest
            {
                TransactionId = transactionId,
                Splits = [
                    new TransactionSplit { Id = "1", PotId = pot1.Id, Amount = 1000 },
                    new TransactionSplit { Id = "2", PotId = pot2.Id, Amount = transaction.TransactionAmount - 1000 }
                ]
            };

            // Act
            await _transactionsService.SplitTransaction(request);

            // Assert
            var newTransaction1 = await DbContext.Transactions.FindAsync($"{transactionId}-1");
            var newTransaction2 = await DbContext.Transactions.FindAsync($"{transactionId}-2");

            Assert.That(newTransaction1!.Processed, Is.True);
            Assert.That(newTransaction2!.Processed, Is.True);
        }
    }
}
