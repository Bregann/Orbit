namespace Orbit.Domain.DTOs.Notes
{
    public class CreateNotePageRequest
    {
        public required string Title { get; set; }
        public int? FolderId { get; set; }
    }
}
