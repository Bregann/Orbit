using Orbit.Domain.DTOs.Finance.Banking;

namespace Orbit.Domain.Interfaces.Helpers
{
    public interface IBankApiHelper
    {
        Task<string?> GetGoCardlessBankingDataAccessToken();
        Task<GoCardlessTransactionsResponse?> GetGoCardlessBankingDataTransactions(string accessToken, string accountName);
        Task<List<Transaction>?> GetMonzoTransactions();
        Task RefreshMonzoToken();
    }
}
