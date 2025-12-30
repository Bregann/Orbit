using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Orbit.Domain.Database.Models
{
    public class FitbitData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required int StepsWalked { get; set; }

        [Required]
        public required decimal DistanceWalkedMiles { get; set; }

        [Required]
        public required DateTime DateRecorded { get; set; }
    }
}
