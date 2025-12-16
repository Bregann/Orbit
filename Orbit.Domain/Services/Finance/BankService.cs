using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.Helpers;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Interfaces.Helpers;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Finance
{
    public class BankService(IBankApiHelper bankApiHelper, IEnvironmentalSettingHelper environmentalSettingHelper, ICommsSenderClient commonsSender, AppDbContext context) : IBankService
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
                // Check if the transaction already exists in the database
                var existingTransaction = await context.Transactions
                    .AnyAsync(t => t.Id == transaction.Id);

                if (existingTransaction)
                {
                    continue;
                }

                //Convert the amount to a positive
                var positiveTransactionAmount = Math.Abs(transaction.Amount);

                await context.Transactions.AddAsync(new Transactions
                {
                    Id = transaction.Id,
                    MerchantName = transaction.Merchant?.Name ?? "Unknown",
                    ImgUrl = transaction.Merchant?.Logo,
                    TransactionAmount = positiveTransactionAmount,
                    Processed = false,
                    TransactionDate = transaction.Created.UtcDateTime
                });

                await context.SaveChangesAsync();

                await commonsSender.SendPushNotification("New Transaction Added", $"A new transaction has been added: {transaction.Merchant?.Name ?? "Unknown"} - £{positiveTransactionAmount / 100.0:0.00}");

                Log.Information($"[Monzo Transactions Job] Added transaction {transaction.Id} - {transaction.Merchant?.Name ?? "Unknown"} - £{positiveTransactionAmount / 100.0:0.00}");
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

            var openBankingTransactions = await bankApiHelper.GetGoCardlessBankingDataTransactions(accessToken, environmentalSettingHelper.GetEnviromentalSettingValue(Enums.EnvironmentalSettingEnum.MainBankAccountId));

            if (openBankingTransactions == null || openBankingTransactions.Transactions.Booked.Length == 0)
            {
                Log.Information("[Open Banking Transactions Job] No new transactions found");
                return;
            }

            // grab the credit card transactions too and add to the list
            var creditCardTransactions = await bankApiHelper.GetGoCardlessBankingDataTransactions(accessToken, environmentalSettingHelper.GetEnviromentalSettingValue(Enums.EnvironmentalSettingEnum.CreditCardAccountId));

            if (creditCardTransactions == null || creditCardTransactions.Transactions.Booked.Length == 0)
            {
                Log.Information("[Open Banking Transactions Job] No new credit card transactions found");
            }
            else if (creditCardTransactions != null)
            {
                openBankingTransactions.Transactions.Booked = openBankingTransactions.Transactions.Booked.Concat(creditCardTransactions.Transactions.Booked).ToArray();
            }

            foreach (var transaction in openBankingTransactions.Transactions.Booked)
            {
                // Check if the transaction already exists in the database
                var existingTransaction = await context.Transactions
                    .AnyAsync(t => t.Id == transaction.TransactionId);

                if (existingTransaction)
                {
                    continue;
                }

                //Convert the amount to a positive
                var positiveTransactionAmount = Math.Abs((int)(decimal.Parse(transaction.TransactionAmount.Amount) * 100));

                await context.Transactions.AddAsync(new Transactions
                {
                    Id = transaction.TransactionId,
                    MerchantName = transaction.RemittanceInformationUnstructured ?? "Unknown",
                    ImgUrl = null,
                    TransactionAmount = positiveTransactionAmount,
                    Processed = false,
                    TransactionDate = transaction.BookingDateTime.UtcDateTime
                });

                await context.SaveChangesAsync();

                await commonsSender.SendPushNotification("New Transaction Added", $"A new transaction has been added: {transaction.RemittanceInformationUnstructured ?? "Unknown"} - £{positiveTransactionAmount / 100.0:0.00}");

                Log.Information($"[Open Banking Transactions Job] Added transaction {transaction.TransactionId} - {transaction.RemittanceInformationUnstructured ?? "Unknown"} - £{positiveTransactionAmount / 100.0:0.00}");
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
