using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.Helpers;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Interfaces.Api.Finance;
using Orbit.Domain.Interfaces.Helpers;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Finance
{
    public class BankService(IBankApiHelper bankApiHelper, IEnvironmentalSettingHelper environmentalSettingHelper, ICommsSenderClient commonsSender, IGoCardlessService goCardlessService, AppDbContext context) : IBankService
    {
        public async Task GetMonzoTransactionsAndAddToDatabase()
        {
            var monzoTransactions = await bankApiHelper.GetMonzoTransactions();

            if (monzoTransactions == null || monzoTransactions.Count == 0)
            {
                Log.Information("[Monzo Transactions Job] No new transactions found");
                return;
            }

            foreach (var transaction in monzoTransactions)
            {
                // Skip positive amounts (money in/refunds)
                if (transaction.Amount > 0)
                {
                    continue;
                }

                // Check if the transaction already exists in the database
                var existingTransaction = await context.Transactions
                    .AnyAsync(t => t.Id == transaction.Id);

                if (existingTransaction)
                {
                    continue;
                }

                //Convert the amount to a positive
                var positiveTransactionAmount = Math.Abs(transaction.Amount);

                var merchantName = transaction.Merchant?.Name ?? "Unknown";

                // Skip excluded merchants
                if (merchantName == "Unknown" ||
                    merchantName.Contains("MONZO CARD        MONZO             VIA MOBILE") ||
                    merchantName.Contains("NS&I"))
                {
                    continue;
                }

                await context.Transactions.AddAsync(new Transactions
                {
                    Id = transaction.Id,
                    MerchantName = merchantName,
                    ImgUrl = transaction.Merchant?.Logo,
                    TransactionAmount = positiveTransactionAmount,
                    Processed = false,
                    TransactionDate = transaction.Created.UtcDateTime
                });

                await context.SaveChangesAsync();

                await commonsSender.SendPushNotification("New Transaction Added", $"A new transaction has been added: {merchantName} - £{positiveTransactionAmount / 100.0:0.00}");

                Log.Information($"[Monzo Transactions Job] Added transaction {transaction.Id} - {merchantName} - £{positiveTransactionAmount / 100.0:0.00}");
            }
        }

        public async Task GetOpenBankingTransactionsAndAddToDatabase()
        {
            var accessToken = await bankApiHelper.GetGoCardlessBankingDataAccessToken();

            if (accessToken == null)
            {
                Log.Error("[Open Banking Transactions Job] No access token found for GoCardless");
                return;
            }

            // Get active account IDs from tracked connections
            var activeAccountIds = await goCardlessService.GetActiveAccountIds();

            // Fall back to environmental settings if no tracked connections exist
            if (activeAccountIds.Count == 0)
            {
                Log.Warning("[Open Banking Transactions Job] No active GoCardless connections found, falling back to environmental settings");

                try
                {
                    var mainAccountId = environmentalSettingHelper.GetEnvironmentalSettingValue(Enums.EnvironmentalSettingEnum.MainBankAccountId);
                    if (!string.IsNullOrEmpty(mainAccountId))
                    {
                        activeAccountIds.Add(mainAccountId);
                    }
                }
                catch (KeyNotFoundException) { }

                try
                {
                    var creditCardId = environmentalSettingHelper.GetEnvironmentalSettingValue(Enums.EnvironmentalSettingEnum.CreditCardAccountId);
                    if (!string.IsNullOrEmpty(creditCardId))
                    {
                        activeAccountIds.Add(creditCardId);
                    }
                }
                catch (KeyNotFoundException) { }

                if (activeAccountIds.Count == 0)
                {
                    Log.Warning("[Open Banking Transactions Job] No account IDs available. Bank connection may have expired.");
                    return;
                }
            }

            var allBookedTransactions = new List<DTOs.Finance.Banking.Booked>();

            foreach (var accountId in activeAccountIds)
            {
                try
                {
                    var transactions = await bankApiHelper.GetGoCardlessBankingDataTransactions(accessToken, accountId);

                    if (transactions?.Transactions?.Booked != null && transactions.Transactions.Booked.Length > 0)
                    {
                        allBookedTransactions.AddRange(transactions.Transactions.Booked);

                        // Update last successful sync on the connection
                        var connection = await context.GoCardlessBankConnections
                            .FirstOrDefaultAsync(c => c.AccountId == accountId);

                        if (connection != null)
                        {
                            connection.LastSuccessfulSync = DateTime.UtcNow;
                            connection.LastSyncError = null;
                        }
                    }
                }
                catch (Exception ex)
                {
                    Log.Error(ex, $"[Open Banking Transactions Job] Failed to fetch transactions for account {accountId}");

                    // Record the error on the connection
                    var connection = await context.GoCardlessBankConnections
                        .FirstOrDefaultAsync(c => c.AccountId == accountId);

                    if (connection != null)
                    {
                        connection.LastSyncError = ex.Message;
                    }
                }
            }

            await context.SaveChangesAsync();

            if (allBookedTransactions.Count == 0)
            {
                Log.Information("[Open Banking Transactions Job] No new transactions found across all accounts");
                return;
            }

            foreach (var transaction in allBookedTransactions)
            {
                //Convert the amount to a positive
                var positiveTransactionAmount = Math.Abs((int)(decimal.Parse(transaction.TransactionAmount.Amount) * 100));

                // Skip positive amounts (money in/refunds)
                if (positiveTransactionAmount == 0 || transaction.TransactionAmount.Amount[0] != '-')
                {
                    continue;
                }

                // Check if the transaction already exists in the database
                var existingTransaction = await context.Transactions
                    .AnyAsync(t => t.Id == transaction.TransactionId);

                if (existingTransaction)
                {
                    continue;
                }

                var merchantName = transaction.RemittanceInformationUnstructured ?? "Unknown";

                // Skip excluded merchants
                if (merchantName == "Unknown" ||
                    merchantName.Contains("MONZO CARD        MONZO             VIA MOBILE") ||
                    merchantName.Contains("NS&I"))
                {
                    continue;
                }

                await context.Transactions.AddAsync(new Transactions
                {
                    Id = transaction.TransactionId,
                    MerchantName = merchantName,
                    ImgUrl = null,
                    TransactionAmount = positiveTransactionAmount,
                    Processed = false,
                    TransactionDate = transaction.BookingDateTime.UtcDateTime
                });

                await context.SaveChangesAsync();

                await commonsSender.SendPushNotification("New Transaction Added", $"A new transaction has been added: {merchantName} - £{positiveTransactionAmount / 100.0:0.00}");

                Log.Information($"[Open Banking Transactions Job] Added transaction {transaction.TransactionId} - {merchantName} - £{positiveTransactionAmount / 100.0:0.00}");
            }
        }

        public async Task UpdateAutomaticTransactions()
        {
            // get all unproecessed transactions
            var unprocessedTransactions = await context.Transactions
                .Where(t => !t.Processed)
                .ToArrayAsync();

            var automaticTransactions = await context.AutomaticTransactions.ToArrayAsync();

            foreach (var transaction in unprocessedTransactions)
            {
                if (automaticTransactions.Any(a => transaction.MerchantName.ToLower().Contains(a.MerchantName.ToLower())))
                {
                    var autoTransaction = automaticTransactions.First(a => transaction.MerchantName.ToLower().Contains(a.MerchantName.ToLower()));

                    var pot = await context.SpendingPots.FindAsync(autoTransaction.PotId);
                    if (pot != null)
                    {
                        // Update the pot amounts
                        pot.PotAmountLeft -= transaction.TransactionAmount;
                        pot.PotAmountSpent += transaction.TransactionAmount;
                        transaction.PotId = autoTransaction.PotId;

                        await commonsSender.SendPushNotification("Automatic Transaction Processed", $"An automatic transaction has been processed: {transaction.MerchantName} - £{transaction.TransactionAmount / 100.0:0.00}. Money left in pot: £{pot.PotAmountLeft / 100.0:0.00}. Pot Name: {pot.PotName}");
                    }

                    transaction.Processed = true;
                    await context.SaveChangesAsync();

                    Log.Information($"[Automatic Transaction] Applied pot to transaction {transaction.Id} - {transaction.MerchantName} - £{transaction.TransactionAmount / 100.0:0.00}");
                }
            }
        }
    }
}
