using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.MoodTracker;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces.Api.MoodTracker;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class MoodController(IMoodTrackerService moodTrackerService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetTodaysMoodResponse> GetTodaysMood()
        {
            return await moodTrackerService.GetTodaysMood();
        }
        [HttpPost]
        public async Task<IActionResult> RecordMood([FromBody] RecordMoodRequest mood)
        {
            try
            {
                await moodTrackerService.RecordMood(mood.Mood);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
