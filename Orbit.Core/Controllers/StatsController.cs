using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.Stats.Responses;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class StatsController(IStatsService statsService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetHomepageStatsDto> GetHomepageStats()
        {
            return await statsService.GetHomepageStats();
        }
    }
}
