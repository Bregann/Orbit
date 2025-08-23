using FinanceManager.Domain.DTOs.Transactions.Requests;
using FinanceManager.Domain.DTOs.Transactions.Responses;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface ITransactionsService
    {
        Task<int> AddAutomaticTransaction(AddAutomaticTransactionRequest request);
        Task<GetAutomaticTransactionsDto> GetAutomaticTransactions();
        Task<GetTransactionsForCurrentMonthDto> GetTransactionsForMonth();
        Task<GetUnprocessedTransactionsDto> GetUnprocessedTransactions();
        Task UpdateTransaction(UpdateTransactionRequest request);
    }
}
