using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.Month.Request;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class MonthController(IMonthService monthService) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> AddNewMonth([FromBody] AddNewMonthRequest request)
        {
            await monthService.AddNewMonth(request);
            return Ok();
        }
    }
}
