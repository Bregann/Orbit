using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Notes;
using Orbit.Domain.Interfaces.Api.Notes;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class NotesController(INoteService noteService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetNotePagesAndFoldersDto> GetNotePagesAndFolders()
        {
            return await noteService.GetNotePagesAndFolders();
        }

        [HttpGet]
        public async Task<ActionResult<GetNotePageDetailsDto>> GetNotePageDetails([FromQuery] int notePageId)
        {
            return await noteService.GetNotePageDetails(notePageId);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotePage([FromBody] CreateNotePageRequest request)
        {
            await noteService.CreateNotePage(request);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateNotePageContent([FromBody] UpdateNotePageContentRequest request)
        {
            await noteService.UpdateNotePageContent(request);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> ToggleNotePageFavouriteStatus([FromQuery] int notePageId)
        {
            await noteService.ToggleNotePageFavouriteStatus(notePageId);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteNotePage([FromQuery] int notePageId)
        {
            await noteService.DeleteNotePage(notePageId);
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> CreateNoteFolder([FromBody] CreateNoteFolderRequest request)
        {
            await noteService.CreateNoteFolder(request);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteNoteFolder([FromQuery] int noteFolderId)
        {
            await noteService.DeleteNoteFolder(noteFolderId);
            return Ok();
        }
    }
}
