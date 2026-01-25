using Microsoft.EntityFrameworkCore;
using Moq;
using Orbit.Domain.DTOs.Finance.Banking;
using Orbit.Domain.Helpers;
using Orbit.Domain.Interfaces.Helpers;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class BankServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private BankService _bankService = null!;
        private Mock<IBankApiHelper> _mockBankApiHelper = null!;
        private Mock<IEnvironmentalSettingHelper> _mockEnvironmentalSettingHelper = null!;
        private Mock<ICommsSenderClient> _mockCommsSenderClient = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestAutomaticTransactions(DbContext);

            _mockBankApiHelper = Infrastructure.MockFactory.CreateBankApiHelper();
            _mockEnvironmentalSettingHelper = Infrastructure.MockFactory.CreateEnvironmentalSettingHelper();
            _mockCommsSenderClient = Infrastructure.MockFactory.CreateCommsSenderClient();

            _bankService = new BankService(
                _mockBankApiHelper.Object,
                _mockEnvironmentalSettingHelper.Object,
                _mockCommsSenderClient.Object,
                DbContext);
        }

        [Test]
        public async Task GetMonzoTransactionsAndAddToDatabase_ShouldNotAddAnything_WhenNoTransactions()
        {
            // Arrange
            _mockBankApiHelper.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(new List<Transaction>());

            var initialCount = await DbContext.Transactions.CountAsync();

            // Act
            await _bankService.GetMonzoTransactionsAndAddToDatabase();

            // Assert
            var finalCount = await DbContext.Transactions.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount));
        }

        [Test]
        public async Task GetMonzoTransactionsAndAddToDatabase_ShouldAddNewTransactions()
        {
            // Arrange
            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = "monzo-txn-001",
                    Amount = -1500, // £15 debit
                    Created = DateTimeOffset.UtcNow,
                    Merchant = new Merchant { Name = "Test Store", Logo = "https://logo.url" }
                }
            };

            _mockBankApiHelper.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(transactions);

            // Act
            await _bankService.GetMonzoTransactionsAndAddToDatabase();

            // Assert
            var savedTransaction = await DbContext.Transactions.FindAsync("monzo-txn-001");
            Assert.That(savedTransaction, Is.Not.Null);
            Assert.That(savedTransaction.MerchantName, Is.EqualTo("Test Store"));
            Assert.That(savedTransaction.TransactionAmount, Is.EqualTo(1500)); // Positive
            Assert.That(savedTransaction.Processed, Is.False);
        }

        [Test]
        public async Task GetMonzoTransactionsAndAddToDatabase_ShouldSendPushNotification()
        {
            // Arrange
            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = "monzo-txn-002",
                    Amount = -2500,
                    Created = DateTimeOffset.UtcNow,
                    Merchant = new Merchant { Name = "Coffee Shop", Logo = "" }
                }
            };

            _mockBankApiHelper.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(transactions);

            // Act
            await _bankService.GetMonzoTransactionsAndAddToDatabase();

            // Assert
            _mockCommsSenderClient.Verify(x => x.SendPushNotification(
                It.Is<string>(s => s == "New Transaction Added"),
                It.Is<string>(s => s.Contains("Coffee Shop"))),
                Times.Once);
        }

        [Test]
        public async Task GetMonzoTransactionsAndAddToDatabase_ShouldSkipExistingTransactions()
        {
            // Arrange
            var existingTransaction = new Domain.Database.Models.Transactions
            {
                Id = "existing-monzo-txn",
                MerchantName = "Existing Merchant",
                TransactionAmount = 1000,
                TransactionDate = DateTime.UtcNow,
                Processed = true
            };
            await DbContext.Transactions.AddAsync(existingTransaction);
            await DbContext.SaveChangesAsync();

            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = "existing-monzo-txn", // Same ID
                    Amount = -1000,
                    Created = DateTimeOffset.UtcNow,
                    Merchant = new Merchant { Name = "Existing Merchant" }
                }
            };

            _mockBankApiHelper.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(transactions);

            // Act
            await _bankService.GetMonzoTransactionsAndAddToDatabase();

            // Assert
            var count = await DbContext.Transactions.CountAsync(t => t.Id == "existing-monzo-txn");
            Assert.That(count, Is.EqualTo(1)); // Should not duplicate
        }

        [Test]
        public async Task GetMonzoTransactionsAndAddToDatabase_ShouldHandleNullMerchant()
        {
            // Arrange
            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = "monzo-null-merchant",
                    Amount = -500,
                    Created = DateTimeOffset.UtcNow,
                    Merchant = null!
                }
            };

            _mockBankApiHelper.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(transactions);

            // Act
            await _bankService.GetMonzoTransactionsAndAddToDatabase();

            // Assert
            var savedTransaction = await DbContext.Transactions.FindAsync("monzo-null-merchant");
            Assert.That(savedTransaction, Is.Not.Null);
            Assert.That(savedTransaction.MerchantName, Is.EqualTo("Unknown"));
        }

        [Test]
        public async Task GetMonzoTransactionsAndAddToDatabase_ShouldNotAddPositiveAmountTransactions()
        {
            // Arrange
            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = "monzo-txn-positive",
                    Amount = 1500, // Positive amount (money in/refund)
                    Created = DateTimeOffset.UtcNow,
                    Merchant = new Merchant { Name = "Refund", Logo = "" }
                }
            };

            _mockBankApiHelper.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(transactions);

            var initialCount = await DbContext.Transactions.CountAsync();

            // Act
            await _bankService.GetMonzoTransactionsAndAddToDatabase();

            // Assert
            var finalCount = await DbContext.Transactions.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount)); // Should not be added
            _mockCommsSenderClient.Verify(x => x.SendPushNotification(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task GetOpenBankingTransactionsAndAddToDatabase_ShouldNotProceed_WhenNoAccessToken()
        {
            // Arrange
            _mockBankApiHelper.Setup(x => x.GetGoCardlessBankingDataAccessToken())
                .ReturnsAsync((string?)null);

            var initialCount = await DbContext.Transactions.CountAsync();

            // Act
            await _bankService.GetOpenBankingTransactionsAndAddToDatabase();

            // Assert
            var finalCount = await DbContext.Transactions.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount));
        }

        [Test]
        public async Task GetOpenBankingTransactionsAndAddToDatabase_ShouldAddNewTransactions()
        {
            // Arrange
            var response = new GoCardlessTransactionsResponse
            {
                Transactions = new Transactions
                {
                    Booked = new[]
                    {
                        new Booked
                        {
                            TransactionId = "gocardless-txn-001",
                            RemittanceInformationUnstructured = "Test Payment",
                            BookingDateTime = DateTimeOffset.UtcNow,
                            TransactionAmount = new TransactionAmount { Amount = "-25.50" }
                        }
                    }
                }
            };

            _mockBankApiHelper.Setup(x => x.GetGoCardlessBankingDataTransactions(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(response);

            // Act
            await _bankService.GetOpenBankingTransactionsAndAddToDatabase();

            // Assert
            var savedTransaction = await DbContext.Transactions.FindAsync("gocardless-txn-001");
            Assert.That(savedTransaction, Is.Not.Null);
            Assert.That(savedTransaction.MerchantName, Is.EqualTo("Test Payment"));
            Assert.That(savedTransaction.TransactionAmount, Is.EqualTo(2550)); // £25.50 in pence
        }

        [Test]
        public async Task GetOpenBankingTransactionsAndAddToDatabase_ShouldNotAddPositiveAmountTransactions()
        {
            // Arrange
            var response = new GoCardlessTransactionsResponse
            {
                Transactions = new Transactions
                {
                    Booked = new[]
                    {
                        new Booked
                        {
                            TransactionId = "gocardless-txn-positive",
                            RemittanceInformationUnstructured = "Refund",
                            BookingDateTime = DateTimeOffset.UtcNow,
                            TransactionAmount = new TransactionAmount { Amount = "25.50" } // Positive amount
                        }
                    }
                }
            };

            _mockBankApiHelper.Setup(x => x.GetGoCardlessBankingDataTransactions(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(response);

            var initialCount = await DbContext.Transactions.CountAsync();

            // Act
            await _bankService.GetOpenBankingTransactionsAndAddToDatabase();

            // Assert
            var finalCount = await DbContext.Transactions.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount)); // Should not be added
            _mockCommsSenderClient.Verify(x => x.SendPushNotification(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task UpdateAutomaticTransactions_ShouldProcessMatchingTransactions()
        {
            // Arrange
            var transaction = new Domain.Database.Models.Transactions
            {
                Id = "auto-match-txn",
                MerchantName = "Netflix Subscription", // Contains "Netflix"
                TransactionAmount = 1599,
                TransactionDate = DateTime.UtcNow,
                Processed = false
            };
            await DbContext.Transactions.AddAsync(transaction);
            await DbContext.SaveChangesAsync();

            // Act
            await _bankService.UpdateAutomaticTransactions();

            // Assert
            var updated = await DbContext.Transactions.FindAsync("auto-match-txn");
            Assert.That(updated!.Processed, Is.True);
            Assert.That(updated.PotId, Is.EqualTo(1)); // Netflix auto-transaction pot
        }

        [Test]
        public async Task UpdateAutomaticTransactions_ShouldUpdatePotAmounts()
        {
            // Arrange
            var pot = DbContext.SpendingPots.First();
            var originalAmountLeft = pot.PotAmountLeft;
            var originalAmountSpent = pot.PotAmountSpent;

            var transaction = new Domain.Database.Models.Transactions
            {
                Id = "auto-pot-update-txn",
                MerchantName = "Netflix Monthly",
                TransactionAmount = 1599,
                TransactionDate = DateTime.UtcNow,
                Processed = false
            };
            await DbContext.Transactions.AddAsync(transaction);
            await DbContext.SaveChangesAsync();

            // Act
            await _bankService.UpdateAutomaticTransactions();

            // Assert
            var updatedPot = await DbContext.SpendingPots.FindAsync(pot.Id);
            Assert.That(updatedPot!.PotAmountLeft, Is.EqualTo(originalAmountLeft - 1599));
            Assert.That(updatedPot.PotAmountSpent, Is.EqualTo(originalAmountSpent + 1599));
        }

        [Test]
        public async Task UpdateAutomaticTransactions_ShouldSendPushNotification()
        {
            // Arrange
            var transaction = new Domain.Database.Models.Transactions
            {
                Id = "auto-notify-txn",
                MerchantName = "Spotify Premium",
                TransactionAmount = 999,
                TransactionDate = DateTime.UtcNow,
                Processed = false
            };
            await DbContext.Transactions.AddAsync(transaction);
            await DbContext.SaveChangesAsync();

            // Act
            await _bankService.UpdateAutomaticTransactions();

            // Assert
            _mockCommsSenderClient.Verify(x => x.SendPushNotification(
                It.Is<string>(s => s == "Automatic Transaction Processed"),
                It.Is<string>(s => s.Contains("Spotify"))),
                Times.Once);
        }

        [Test]
        public async Task UpdateAutomaticTransactions_ShouldNotProcessAlreadyProcessed()
        {
            // Arrange
            var transaction = new Domain.Database.Models.Transactions
            {
                Id = "already-processed-txn",
                MerchantName = "Netflix",
                TransactionAmount = 1599,
                TransactionDate = DateTime.UtcNow,
                Processed = true // Already processed
            };
            await DbContext.Transactions.AddAsync(transaction);
            await DbContext.SaveChangesAsync();

            // Act
            await _bankService.UpdateAutomaticTransactions();

            // Assert
            _mockCommsSenderClient.Verify(x => x.SendPushNotification(
                It.IsAny<string>(),
                It.Is<string>(s => s.Contains("Netflix"))),
                Times.Never);
        }

        [Test]
        public async Task UpdateAutomaticTransactions_ShouldBeCaseInsensitive()
        {
            // Arrange
            var transaction = new Domain.Database.Models.Transactions
            {
                Id = "case-insensitive-txn",
                MerchantName = "NETFLIX ENTERTAINMENT", // Uppercase
                TransactionAmount = 1599,
                TransactionDate = DateTime.UtcNow,
                Processed = false
            };
            await DbContext.Transactions.AddAsync(transaction);
            await DbContext.SaveChangesAsync();

            // Act
            await _bankService.UpdateAutomaticTransactions();

            // Assert
            var updated = await DbContext.Transactions.FindAsync("case-insensitive-txn");
            Assert.That(updated!.Processed, Is.True);
            Assert.That(updated.PotId, Is.EqualTo(1));
        }
    }
}
