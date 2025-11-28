using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Month.Request;
using Orbit.Domain.Interfaces.Api;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MonthController(IMonthService monthService) : ControllerBase
    {
        [HttpPost("AddNewMonth")]
        public async Task<IActionResult> AddNewMonth([FromBody] AddNewMonthRequest request)
        {
            await monthService.AddNewMonth(request);
            return Ok();
        }
    }
}
