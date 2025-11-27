using Orbit.Domain.DTOs.Stats.Responses;

namespace Orbit.Domain.Interfaces.Api
{
    public interface IStatsService
    {
        Task<GetHomepageStatsDto> GetHomepageStats();
    }
}
