using FinanceManager.Domain.DTOs.Stats.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Core.Controllers
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
