using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Chores;
using Orbit.Domain.Interfaces.Api.Chores;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class ChoresController(IChoresService choresService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetChoresResponse> GetChores()
        {
            return await choresService.GetChores();
        }

        [HttpPost]
        public async Task<IActionResult> AddChore([FromBody] AddChoreRequest request)
        {
            var newChoreId = await choresService.AddChore(request);
            return Ok(newChoreId);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateChore([FromBody] UpdateChoreRequest request)
        {
            await choresService.UpdateChore(request);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> CompleteChore([FromQuery] int choreId)
        {
            await choresService.CompleteChore(choreId);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteChore([FromQuery] int choreId)
        {
            await choresService.DeleteChore(choreId);
            return Ok();
        }
    }
}
