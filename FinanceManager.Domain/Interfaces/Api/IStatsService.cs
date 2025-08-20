using FinanceManager.Domain.DTOs.Stats.Responses;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface IStatsService
    {
        Task<GetHomepageStatsDto> GetHomepageStats();
    }
}