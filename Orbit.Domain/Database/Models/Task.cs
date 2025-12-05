using Orbit.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class Task
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Description { get; set; }

        [Required]
        public required TaskPriorityType Priority { get; set; }

        [Required]
        public required DateTime CreatedAt { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? CompletedAt { get; set; }

        [Required]
        public int TaskCategoryId { get; set; }

        [ForeignKey(nameof(TaskCategoryId))]
        public virtual TaskCategory TaskCategory { get; set; } = null!;
    }
}
