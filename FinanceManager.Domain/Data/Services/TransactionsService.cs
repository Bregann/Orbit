using FinanceManager.Domain.Database.Context;
using FinanceManager.Domain.DTOs.Transactions;
using FinanceManager.Domain.DTOs.Transactions.Requests;
using FinanceManager.Domain.DTOs.Transactions.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.Data.Services
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
                        TransactionAmount = t.TransactionAmount,
                        TransactionDate = t.TransactionDate,
                        PotId = t.PotId
                    })
                    .ToArrayAsync()
            };
        }
    }
}
