using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class NoteFolder
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string FolderName { get; set; }

        [Required]
        public required string FolderIcon { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ICollection<NotePage> Notes { get; set; } = null!;
    }
}
