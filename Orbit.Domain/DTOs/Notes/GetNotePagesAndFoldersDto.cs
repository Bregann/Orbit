namespace Orbit.Domain.DTOs.Notes
{
    public class GetNotePagesAndFoldersDto
    {
        public required NotePageItem[] NotePages { get; set; }
        public required NoteFolderItem[] NoteFolders { get; set; }
    }

    public class NotePageItem
    {
        public required int Id { get; set; }
        public required string Title { get; set; }
        public required bool IsFavourite { get; set; }
        public int? FolderId { get; set; }
    }

    public class NoteFolderItem
    {
        public required int Id { get; set; }
        public required string FolderName { get; set; }
        public required string FolderIcon { get; set; }
    }
}
