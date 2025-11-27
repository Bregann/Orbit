using Orbit.Domain.DTOs.Stats.Responses;
using Orbit.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
