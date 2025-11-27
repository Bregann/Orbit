using Orbit.Domain.DTOs.Pots.Request;
using Orbit.Domain.DTOs.Pots.Responses;
using Orbit.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class PotsController(IPotsService potsService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions()
        {
            return await potsService.GetSpendingPotDropdownOptions();
        }

        [HttpGet]
        public async Task<GetAllPotDataDto> GetAllPotData()
        {
            return await potsService.GetAllPotData();
        }

        [HttpGet]
        public async Task<GetManagePotDataDto> GetManagePotData()
        {
            return await potsService.GetManagePotData();
        }

        [HttpGet]
        public async Task<GetAddMonthPotDataDto> GetAddMonthPotData()
        {
            return await potsService.GetAddMonthPotData();
        }

        [HttpPost]
        public async Task<IActionResult> AddNewPot([FromBody] AddNewPotRequest request)
        {
            try
            {
                var newPotId = await potsService.AddNewPot(request);
                return Ok(newPotId);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}
