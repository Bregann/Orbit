using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Assets;
using Orbit.Domain.Interfaces.Api.Assets;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class AssetsController(IAssetsService assetsService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<GetAllAssetsDto>> GetAllAssets()
        {
            var assets = await assetsService.GetAllAssets();
            return Ok(assets);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateAsset([FromBody] CreateAssetRequest request)
        {
            try
            {
                var assetId = await assetsService.CreateAsset(request);
                return Ok(assetId);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsset([FromBody] UpdateAssetRequest request)
        {
            try
            {
                await assetsService.UpdateAsset(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteAsset([FromQuery] int assetId)
        {
            try
            {
                await assetsService.DeleteAsset(assetId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<GetAllAssetCategoriesDto>> GetAllAssetCategories()
        {
            var categories = await assetsService.GetAllAssetCategories();
            return Ok(categories);
        }

        [HttpPost]
        public async Task<ActionResult> AddAssetCategory([FromBody] AddAssetCategoryRequest request)
        {
            try
            {
                await assetsService.AddAssetCategory(request);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteAssetCategory([FromQuery] int categoryId)
        {
            try
            {
                await assetsService.DeleteAssetCategory(categoryId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> UploadAssetDocument([FromForm] UploadAssetDocumentRequest request, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file provided");
                }

                if (request.DocumentType != "Receipt" && request.DocumentType != "Manual")
                {
                    return BadRequest("DocumentType must be either 'Receipt' or 'Manual'");
                }

                using (var stream = file.OpenReadStream())
                {
                    await assetsService.UploadAssetDocument(request, stream, Path.GetExtension(file.FileName));
                }

                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult> DownloadAssetDocument([FromQuery] int assetId, [FromQuery] string documentType)
        {
            try
            {
                var (fileBytes, fileName) = await assetsService.DownloadAssetDocument(assetId, documentType);
                
                var contentType = Path.GetExtension(fileName).ToLower() switch
                {
                    ".pdf" => "application/pdf",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".bmp" => "image/bmp",
                    _ => "application/octet-stream"
                };

                return File(fileBytes, contentType, fileName);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteAssetDocument([FromQuery] int assetId, [FromQuery] string documentType)
        {
            try
            {
                await assetsService.DeleteAssetDocument(assetId, documentType);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
