namespace Orbit.Domain.DTOs.Assets
{
    public class UploadAssetDocumentRequest
    {
        public required int AssetId { get; set; }
        public required string DocumentType { get; set; } // "Receipt" or "Manual"
    }
}
