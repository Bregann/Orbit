using Orbit.Domain.DTOs.Assets;

namespace Orbit.Domain.Interfaces.Api.Assets
{
    public interface IAssetsService
    {
        Task<GetAllAssetsDto> GetAllAssets();
        Task<int> CreateAsset(CreateAssetRequest request);
        Task UpdateAsset(UpdateAssetRequest request);
        Task DeleteAsset(int assetId);
        Task<GetAllAssetCategoriesDto> GetAllAssetCategories();
        Task AddAssetCategory(AddAssetCategoryRequest request);
        Task DeleteAssetCategory(int categoryId);
        Task UploadAssetDocument(UploadAssetDocumentRequest request, Stream documentStream, string fileExtension);
        Task<(byte[] fileBytes, string fileName)> DownloadAssetDocument(int assetId, string documentType);
        Task DeleteAssetDocument(int assetId, string documentType);
    }
}
