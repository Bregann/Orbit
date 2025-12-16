using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Documents;
using Orbit.Domain.Interfaces.Api.Documents;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class DocumentsController(IDocumentsService documentsService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<GetAllDocumentsDto>> GetAllDocuments()
        {
            var documents = await documentsService.GetAllDocuments();
            return Ok(documents);
        }

        [HttpPost]
        public async Task<ActionResult> UploadDocument([FromForm] UploadDocumentRequest request, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file provided");
                }

                using (var stream = file.OpenReadStream())
                {
                    await documentsService.UploadDocument(request, stream, Path.GetExtension(file.FileName));
                }

                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult> DownloadDocument([FromQuery] int documentId)
        {
            try
            {
                var fileBytes = await documentsService.DownloadDocument(documentId);
                return File(fileBytes, "application/octet-stream");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteDocument([FromQuery] int documentId)
        {
            try
            {
                await documentsService.DeleteDocument(documentId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<GetAllDocumentCategoriesDto>> GetAllDocumentCategories()
        {
            var categories = await documentsService.GetAllDocumentCategories();
            return Ok(categories);
        }

        [HttpPost]
        public async Task<ActionResult> AddDocumentCategory([FromQuery] string categoryName)
        {
            try
            {
                await documentsService.AddDocumentCategory(categoryName);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteCategory([FromQuery] int categoryId)
        {
            try
            {
                await documentsService.DeleteCategory(categoryId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}
