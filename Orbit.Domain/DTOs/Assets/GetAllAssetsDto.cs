namespace Orbit.Domain.DTOs.Assets
{
    public class GetAllAssetsDto
    {
        public required AssetItem[] Assets { get; set; }
    }

    public class AssetItem
    {
        public required int AssetId { get; set; }
        public required string AssetName { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public required DateTime PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? Location { get; set; }
        public DateTime? WarrantyExpirationDate { get; set; }
        public string? Notes { get; set; }
        public required string Status { get; set; }
        public required int CategoryId { get; set; }
        public required string CategoryName { get; set; }
        public bool HasReceipt { get; set; }
        public bool HasManual { get; set; }
        public required DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
    }
}
