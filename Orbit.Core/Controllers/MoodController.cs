using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.MoodTracker;
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

        [HttpGet]
        public async Task<GetYearlyMoodResponse> GetYearlyMood([FromQuery] int year)
        {
            return await moodTrackerService.GetYearlyMood(year);
        }

        [HttpGet]
        public async Task<GetAvailableYearsResponse> GetAvailableYears()
        {
            return await moodTrackerService.GetAvailableYears();
        }

        [HttpPost]
        public async Task<IActionResult> RecordMood([FromBody] RecordMoodRequest request)
        {
            try
            {
                await moodTrackerService.RecordMood(request.Mood);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> RecordMoodForDate([FromBody] RecordMoodForDateRequest request)
        {
            try
            {
                await moodTrackerService.RecordMoodForDate(request.Mood, request.Date);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
