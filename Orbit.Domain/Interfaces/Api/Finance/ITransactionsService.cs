using Orbit.Domain.DTOs.Finance.Transactions.Requests;
using Orbit.Domain.DTOs.Finance.Transactions.Responses;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface ITransactionsService
    {
        Task<int> AddAutomaticTransaction(AddAutomaticTransactionRequest request);
        Task<GetAutomaticTransactionsDto> GetAutomaticTransactions();
        Task<GetTransactionsForCurrentMonthDto> GetTransactionsForMonth();
        Task<GetUnprocessedTransactionsDto> GetUnprocessedTransactions();
        Task MarkAsSubscription(string transactionId);
        Task UpdateTransaction(UpdateTransactionRequest request);
    }
}
