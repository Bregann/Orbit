namespace Orbit.Domain.DTOs.Assets
{
    public class AddAssetCategoryRequest
    {
        public required string CategoryName { get; set; }
        public string? Description { get; set; }
    }
}
