using Orbit.Domain.DTOs.Finance.Banking;

namespace Orbit.Domain.Interfaces.Helpers
{
    public interface IBankApiHelper
    {
        Task<string?> GetGoCardlessBankingDataAccessToken();
        Task<GoCardlessTransactionsResponse?> GetGoCardlessBankingDataTransactions(string accessToken, string accountName);
        Task<List<Transaction>?> GetMonzoTransactions();
        Task RefreshMonzoToken();
        Task<List<GoCardlessInstitution>?> GetGoCardlessInstitutions(string accessToken, string country);
        Task<GoCardlessAgreementResponse?> CreateEndUserAgreement(string accessToken, string institutionId, int accessValidForDays = 90);
        Task<GoCardlessRequisitionResponse?> CreateRequisition(string accessToken, string agreementId, string institutionId, string redirectUrl);
        Task<GoCardlessRequisitionResponse?> GetRequisition(string accessToken, string requisitionId);
        Task<bool> DeleteRequisition(string accessToken, string requisitionId);
    }
}
