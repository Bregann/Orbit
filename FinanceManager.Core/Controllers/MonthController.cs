using FinanceManager.Domain.DTOs.Month.Request;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
