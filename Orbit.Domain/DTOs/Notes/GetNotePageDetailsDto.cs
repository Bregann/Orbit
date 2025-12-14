namespace Orbit.Domain.DTOs.Notes
{
    public class GetNotePageDetailsDto
    {
        public required NotePageDetails NotePage { get; set; }
    }

    public class NotePageDetails
    {
        public required int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required bool IsFavourite { get; set; }
        public int? FolderId { get; set; }
    }
}
