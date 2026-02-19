namespace Orbit.Domain.DTOs.Assets
{
    public class CreateAssetRequest
    {
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
    }
}
