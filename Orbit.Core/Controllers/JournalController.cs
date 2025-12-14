using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Journal;
using Orbit.Domain.Interfaces.Api.Journal;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class JournalController(IJournalService journalService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetJournalEntriesDto> GetJournalEntries()
        {
            return await journalService.GetJournalEntries();
        }

        [HttpPost]
        public async Task<IActionResult> CreateJournalEntry([FromBody] CreateJournalEntryRequest request)
        {
            await journalService.CreateJournalEntry(request);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteJournalEntry([FromQuery] int id)
        {
            try
            {
                await journalService.DeleteJournalEntry(id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
