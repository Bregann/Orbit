namespace Orbit.Domain.DTOs.Assets
{
    public class GetAllAssetCategoriesDto
    {
        public required AssetCategoryItem[] Categories { get; set; }
    }

    public class AssetCategoryItem
    {
        public required int CategoryId { get; set; }
        public required string CategoryName { get; set; }
        public string? Description { get; set; }
        public required int AssetCount { get; set; }
    }
}
