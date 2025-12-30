using Orbit.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class MoodTrackerEntry
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required MoodTrackerEnum MoodType { get; set; }

        [Required]
        public required DateTime DateRecorded { get; set; }
    }
}
