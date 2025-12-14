namespace Orbit.Domain.DTOs.Notes
{
    public class UpdateNotePageContentRequest
    {
        public required int NotePageId { get; set; }
        public required string Content { get; set; }
    }
}
