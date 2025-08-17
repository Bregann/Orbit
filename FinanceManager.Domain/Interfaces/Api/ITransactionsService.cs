using FinanceManager.Domain.DTOs.Transactions.Requests;
using FinanceManager.Domain.DTOs.Transactions.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface ITransactionsService
    {
        Task<GetUnprocessedTransactionsDto> GetUnprocessedTransactions();
        Task UpdateTransaction(UpdateTransactionRequest request);
    }
}
