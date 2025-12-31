using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class FitbitData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required int StepsWalked { get; set; }

        [Required]
        public required double DistanceWalkedMiles { get; set; }

        [Required]
        public required DateTime DateRecorded { get; set; }
    }
}
