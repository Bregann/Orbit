namespace Orbit.Domain.DTOs.Notes
{
    public class CreateNoteFolderRequest
    {
        public required string FolderName { get; set; }
        public required string FolderIcon { get; set; }
    }
}
