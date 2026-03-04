using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Assets;
using Orbit.Domain.Exceptions;
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
            var assetId = await assetsService.CreateAsset(request);
            return Ok(assetId);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsset([FromBody] UpdateAssetRequest request)
        {
            await assetsService.UpdateAsset(request);
            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteAsset([FromQuery] int assetId)
        {
            await assetsService.DeleteAsset(assetId);
            return Ok();
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
            await assetsService.AddAssetCategory(request);
            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteAssetCategory([FromQuery] int categoryId)
        {
            await assetsService.DeleteAssetCategory(categoryId);
            return Ok();
        }

        [HttpPost]
        public async Task<ActionResult> UploadAssetDocument([FromForm] UploadAssetDocumentRequest request, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new BadRequestException("No file provided");
            }

            if (request.DocumentType != "Receipt" && request.DocumentType != "Manual")
            {
                throw new BadRequestException("DocumentType must be either 'Receipt' or 'Manual'");
            }

            using (var stream = file.OpenReadStream())
            {
                await assetsService.UploadAssetDocument(request, stream, Path.GetExtension(file.FileName));
            }

            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult> DownloadAssetDocument([FromQuery] int assetId, [FromQuery] string documentType)
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

        [HttpDelete]
        public async Task<ActionResult> DeleteAssetDocument([FromQuery] int assetId, [FromQuery] string documentType)
        {
            await assetsService.DeleteAssetDocument(assetId, documentType);
            return Ok();
        }
    }
}
