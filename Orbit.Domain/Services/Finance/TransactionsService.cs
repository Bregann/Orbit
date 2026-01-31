using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Finance.Transactions;
using Orbit.Domain.DTOs.Finance.Transactions.Requests;
using Orbit.Domain.DTOs.Finance.Transactions.Responses;
using Orbit.Domain.Extensions;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Domain.Services.Finance
{
    public class TransactionsService(AppDbContext context) : ITransactionsService
    {
        public async Task UpdateTransaction(UpdateTransactionRequest request)
        {
            var transaction = await context.Transactions.FindAsync(request.TransactionId);

            if (transaction == null)
            {
                throw new KeyNotFoundException($"Transaction with ID {request.TransactionId} not found.");
            }

            if (request.PotId.HasValue)
            {
                var pot = await context.SpendingPots.FindAsync(request.PotId.Value);

                if (pot == null)
                {
                    throw new KeyNotFoundException($"Spending pot with ID {request.PotId.Value} not found.");
                }

                // check if the transaction already had a pot assigned as we need to update the pot amounts
                if (transaction.PotId.HasValue)
                {
                    var oldPot = await context.SpendingPots.FindAsync(transaction.PotId.Value);

                    if (oldPot != null)
                    {
                        // Update the old pot amounts
                        oldPot.PotAmountLeft += transaction.TransactionAmount;
                        oldPot.PotAmountSpent -= transaction.TransactionAmount;
                    }
                }

                // Update the new pot amounts
                pot.PotAmountLeft -= transaction.TransactionAmount;
                pot.PotAmountSpent += transaction.TransactionAmount;

                transaction.PotId = request.PotId.Value;
            }
            else
            {
                transaction.PotId = null;
            }

            transaction.Processed = true;
            await context.SaveChangesAsync();
        }

        public async Task<GetUnprocessedTransactionsDto> GetUnprocessedTransactions()
        {
            return new GetUnprocessedTransactionsDto
            {
                UnprocessedTransactions = await context.Transactions
                    .Where(t => !t.Processed)
                    .Select(t => new TransactionsTableRow
                    {
                        Id = t.Id,
                        MerchantName = t.MerchantName,
                        IconUrl = t.ImgUrl ?? "",
                        TransactionAmount = t.TransactionAmount.ToPoundsString(),
                        TransactionDate = t.TransactionDate,
                        PotId = t.PotId
                    })
                    .ToArrayAsync()
            };
        }

        public async Task<GetTransactionsForCurrentMonthDto> GetTransactionsForMonth()
        {
            // get the current month
            var startDate = context.HistoricData.OrderByDescending(h => h.StartDate)
                .Select(h => h.StartDate)
                .FirstOrDefault();

            if (startDate == default)
            {
                return new GetTransactionsForCurrentMonthDto
                {
                    Transactions = []
                };
            }

            // get all the transactions since the startDate
            var transactions = await context.Transactions
                .Where(t => t.TransactionDate >= startDate && t.TransactionDate < DateTime.Now)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new TransactionsTableRow
                {
                    Id = t.Id,
                    MerchantName = t.MerchantName,
                    IconUrl = t.ImgUrl ?? "",
                    TransactionAmount = t.TransactionAmount.ToPoundsString(),
                    TransactionDate = t.TransactionDate,
                    PotId = t.PotId
                })
                .ToArrayAsync();

            return new GetTransactionsForCurrentMonthDto
            {
                Transactions = transactions
            };
        }

        public async Task<GetAutomaticTransactionsDto> GetAutomaticTransactions()
        {
            return new GetAutomaticTransactionsDto
            {
                AutomaticTransactions = await context.AutomaticTransactions
                    .Select(at => new AutomaticTransaction
                    {
                        Id = at.Id,
                        MerchantName = at.MerchantName,
                        PotId = at.PotId,
                        IsSubscription = at.IsSubscription
                    })
                    .ToArrayAsync()
            };
        }

        public async Task<int> AddAutomaticTransaction(AddAutomaticTransactionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MerchantName) || request.PotId <= 0)
            {
                throw new ArgumentException("Invalid merchant name or pot ID.");
            }

            // check if an automatic transaction with the same merchant name already exists
            var existing = await context.AutomaticTransactions
                .AnyAsync(at => at.MerchantName.ToLower() == request.MerchantName.ToLower());

            if (existing)
            {
                throw new InvalidOperationException($"An automatic transaction for merchant '{request.MerchantName}' already exists.");
            }

            if (request.PotId == null && request.IsSubscription)
            {
                var automaticTransaction = new Database.Models.AutomaticTransaction
                {
                    MerchantName = request.MerchantName,
                    PotId = null,
                    IsSubscription = true
                };

                await context.AutomaticTransactions.AddAsync(automaticTransaction);
                await context.SaveChangesAsync();

                return automaticTransaction.Id;
            }
            else
            {
                var pot = await context.SpendingPots.FindAsync(request.PotId);

                if (pot == null)
                {
                    throw new KeyNotFoundException($"Spending pot with ID {request.PotId} not found.");
                }

                var automaticTransaction = new Database.Models.AutomaticTransaction
                {
                    MerchantName = request.MerchantName,
                    PotId = request.PotId,
                    IsSubscription = request.IsSubscription
                };

                context.AutomaticTransactions.Add(automaticTransaction);
                await context.SaveChangesAsync();

                return automaticTransaction.Id;
            }

            throw new Exception("Failed to add automatic transaction.");
        }

        public async Task MarkAsSubscription(string transactionId)
        {
            var rows = await context.Transactions
                .Where(t => t.Id == transactionId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(t => t.IsSubscriptionPayment, true));

            if (rows == 0)
            {
                throw new KeyNotFoundException($"Transaction with ID {transactionId} not found.");
            }
        }

        public async Task SplitTransaction(SplitTransactionRequest request)
        {
            var originalTransaction = await context.Transactions
                .FirstOrDefaultAsync(t => t.Id == request.TransactionId);

            if (originalTransaction == null)
            {
                throw new KeyNotFoundException($"Transaction with ID {request.TransactionId} not found.");
            }

            // Filter out splits with potId == -1 (these amounts are discarded)
            var validSplits = request.Splits.Where(s => s.PotId != -1).ToList();

            // Validate that split amounts don't exceed the original transaction amount
            var totalSplitAmount = request.Splits.Sum(s => s.Amount);
            if (totalSplitAmount != originalTransaction.TransactionAmount)
            {
                throw new ArgumentException($"Split amounts ({totalSplitAmount}) must equal the original transaction amount ({originalTransaction.TransactionAmount}).");
            }

            // If original transaction had a pot assigned, revert those amounts
            if (originalTransaction.PotId.HasValue && originalTransaction.Pot != null)
            {
                originalTransaction.Pot.PotAmountLeft += originalTransaction.TransactionAmount;
                originalTransaction.Pot.PotAmountSpent -= originalTransaction.TransactionAmount;
            }

            if (validSplits.Count == 0)
            {
                // All amounts were discarded (potId == -1), set transaction to 0p and mark as processed
                originalTransaction.TransactionAmount = 0;
                originalTransaction.Processed = true;
            }
            else if (validSplits.Count == 1)
            {
                // Only one valid split, update the original transaction
                var split = validSplits[0];
                var pot = await context.SpendingPots.FindAsync(split.PotId);

                if (pot == null)
                {
                    throw new KeyNotFoundException($"Spending pot with ID {split.PotId} not found.");
                }

                originalTransaction.TransactionAmount = split.Amount;
                originalTransaction.PotId = split.PotId;
                originalTransaction.Processed = true;

                // Update the pot amounts
                pot.PotAmountLeft -= split.Amount;
                pot.PotAmountSpent += split.Amount;
            }
            else
            {
                // Multiple valid splits, set original to 0p and processed and create new transactions
                originalTransaction.TransactionAmount = 0;
                originalTransaction.Processed = true;

                for (int i = 0; i < validSplits.Count; i++)
                {
                    var split = validSplits[i];
                    var pot = await context.SpendingPots.FindAsync(split.PotId);

                    if (pot == null)
                    {
                        throw new KeyNotFoundException($"Spending pot with ID {split.PotId} not found.");
                    }

                    var newTransaction = new Database.Models.Transactions
                    {
                        Id = $"{request.TransactionId}-{i + 1}",
                        MerchantName = originalTransaction.MerchantName,
                        TransactionAmount = split.Amount,
                        TransactionDate = originalTransaction.TransactionDate,
                        Processed = true,
                        PotId = split.PotId,
                        ImgUrl = originalTransaction.ImgUrl,
                        IsSubscriptionPayment = originalTransaction.IsSubscriptionPayment
                    };

                    await context.Transactions.AddAsync(newTransaction);

                    // Update the pot amounts
                    pot.PotAmountLeft -= split.Amount;
                    pot.PotAmountSpent += split.Amount;
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
