using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class Document
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string DocumentName { get; set; }

        [Required]
        public required string DocumentPath { get; set; }

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// The MIME type of the document (e.g., application/pdf, image/png).
        /// </summary>
        [Required]
        public required string DocumentType { get; set; }

        public required int DocumentCategoryId { get; set; }

        [ForeignKey(nameof(DocumentCategoryId))]
        public virtual DocumentCategory DocumentCategory { get; set; } = null!;
    }
}
