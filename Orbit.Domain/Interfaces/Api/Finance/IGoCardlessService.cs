using Orbit.Domain.DTOs.Finance.Banking;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface IGoCardlessService
    {
        Task<GoCardlessConnectionStatusDto> GetConnectionStatus();
        Task<List<GoCardlessInstitution>?> GetInstitutions(string country);
        Task<GoCardlessInitiateConnectionResponse> InitiateConnection(string institutionId);
        Task CompleteConnection(string requisitionId);
        Task DisconnectBank(int connectionId);
        Task CheckAndNotifyExpiringConnections();
        Task<List<string>> GetActiveAccountIds();
    }
}
