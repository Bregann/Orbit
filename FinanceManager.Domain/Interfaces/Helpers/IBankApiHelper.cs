using FinanceManager.Domain.DTOs.Banking;

namespace FinanceManager.Domain.Interfaces.Helpers
{
    public interface IBankApiHelper
    {
        Task<string?> GetGoCardlessBankingDataAccessToken();
        Task<GoCardlessTransactionsResponse?> GetGoCardlessBankingDataTransactions(string accessToken, string accountName);
        Task<List<Transaction>?> GetMonzoTransactions();
        Task RefreshMonzoToken();
    }
}
