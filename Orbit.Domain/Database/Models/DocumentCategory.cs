using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class DocumentCategory
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string CategoryName { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ICollection<Document> Documents { get; set; } = null!;
    }
}
