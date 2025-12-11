namespace Orbit.Domain.DTOs.Documents
{
    public class GetAllDocumentsDto
    {
        public required DocumentItem[] Documents { get; set; }
    }

    public class DocumentItem
    {
        public required int DocumentId { get; set; }
        public required int CategoryId { get; set; }
        public required string DocumentName { get; set; }
        public required string DocumentType { get; set; }
        public required DateTime UploadedAt { get; set; }
    }
}
