using Orbit.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class Chore
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Description { get; set; }

        [Required]
        public required ChoreFrequencyType Frequency { get; set; }

        /// <summary>
        /// Number of days between occurrences when Frequency is Custom.
        /// Null for all other frequency types.
        /// </summary>
        public int? CustomFrequencyDays { get; set; }

        [Required]
        public required DateTime NextDueDate { get; set; }

        public DateTime? LastCompletedAt { get; set; }

        [Required]
        public required DateTime CreatedAt { get; set; }
    }
}
