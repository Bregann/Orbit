using Orbit.Domain.DTOs.Dashboard;

namespace Orbit.Domain.Interfaces.Api.Dashboard
{
    public interface IDashboardService
    {
        Task<GetDashboardOverviewDataDto> GetDashboardOverviewData();
    }
}
