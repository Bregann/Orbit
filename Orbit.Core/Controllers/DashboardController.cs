using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Dashboard;
using Orbit.Domain.Interfaces.Api.Dashboard;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class DashboardController(IDashboardService dashboardService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetDashboardOverviewDataDto> GetDashboardOverviewData()
        {
            return await dashboardService.GetDashboardOverviewData();
        }
    }
}
