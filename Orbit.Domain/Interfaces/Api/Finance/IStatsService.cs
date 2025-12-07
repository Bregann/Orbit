using Orbit.Domain.DTOs.Finance.Stats.Responses;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface IStatsService
    {
        Task<GetHomepageStatsDto> GetHomepageStats();
    }
}
