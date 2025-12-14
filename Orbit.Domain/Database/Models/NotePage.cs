using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class NotePage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        [Required]
        public required string Content { get; set; }

        [Required]
        public required DateTime CreatedAt { get; set; }

        [Required]
        public required bool IsFavourite { get; set; }

        public int? FolderId { get; set; }

        [ForeignKey(nameof(FolderId))]
        public virtual NoteFolder? Folder { get; set; }
    }
}
