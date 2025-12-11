namespace Orbit.Domain.DTOs.Documents
{
    public class UploadDocumentRequest
    {
        public required string DocumentName { get; set; }
        public required string DocumentType { get; set; }
        public required int CategoryId { get; set; }
    }
}
