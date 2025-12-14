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
            try
            {
                return await noteService.GetNotePageDetails(notePageId);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
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
            try
            {
                await noteService.UpdateNotePageContent(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> ToggleNotePageFavouriteStatus([FromQuery] int notePageId)
        {
            try
            {
                await noteService.ToggleNotePageFavouriteStatus(notePageId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteNotePage([FromQuery] int notePageId)
        {
            try
            {
                await noteService.DeleteNotePage(notePageId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
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
            try
            {
                await noteService.DeleteNoteFolder(noteFolderId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
