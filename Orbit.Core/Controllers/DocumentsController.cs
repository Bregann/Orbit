using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Documents;
using Orbit.Domain.Exceptions;
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
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("No file provided");
            }

            using (var stream = file.OpenReadStream())
            {
                await documentsService.UploadDocument(request, stream, Path.GetExtension(file.FileName));
            }

            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult> DownloadDocument([FromQuery] int documentId)
        {
            var fileBytes = await documentsService.DownloadDocument(documentId);
            return File(fileBytes, "application/octet-stream");
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteDocument([FromQuery] int documentId)
        {
            await documentsService.DeleteDocument(documentId);
            return Ok();
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
            await documentsService.AddDocumentCategory(categoryName);
            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteCategory([FromQuery] int categoryId)
        {
            await documentsService.DeleteCategory(categoryId);
            return Ok();
        }
    }
}
