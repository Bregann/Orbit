using Orbit.Domain.DTOs.Transactions.Requests;
using Orbit.Domain.DTOs.Transactions.Responses;

namespace Orbit.Domain.Interfaces.Api
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
