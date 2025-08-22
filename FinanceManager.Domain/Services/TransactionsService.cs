using FinanceManager.Domain.Database.Context;
using FinanceManager.Domain.DTOs.Transactions;
using FinanceManager.Domain.DTOs.Transactions.Requests;
using FinanceManager.Domain.DTOs.Transactions.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Domain.Services
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
                        TransactionAmount = $"£{t.TransactionAmount / 100.0:0.00}",
                        TransactionDate = t.TransactionDate,
                        PotId = t.PotId
                    })
                    .ToArrayAsync()
            };
        }

        public async Task<GetTransactionsForCurrentMonthDto> GetTransactionsForMonth()
        {
            // get the current month
            var startDate = context.HistoricData.OrderByDescending(h => h.DateAdded)
                .Select(h => h.DateAdded)
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
                    TransactionAmount = $"£{t.TransactionAmount / 100.0:0.00}",
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
                        PotId = at.PotId
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

            var pot = await context.SpendingPots.FindAsync(request.PotId);

            if (pot == null)
            {
                throw new KeyNotFoundException($"Spending pot with ID {request.PotId} not found.");
            }

            // check if an automatic transaction with the same merchant name already exists
            var existing = await context.AutomaticTransactions
                .AnyAsync(at => at.MerchantName.ToLower() == request.MerchantName.ToLower());

            if (existing)
            {
                throw new InvalidOperationException($"An automatic transaction for merchant '{request.MerchantName}' already exists.");
            }

            var automaticTransaction = new Database.Models.AutomaticTransaction
            {
                MerchantName = request.MerchantName,
                PotId = request.PotId
            };

            context.AutomaticTransactions.Add(automaticTransaction);
            await context.SaveChangesAsync();

            return automaticTransaction.Id;
        }
    }
}
