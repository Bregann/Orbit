using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class CalendarEventType
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string EventTypeName { get; set; }

        [Required]
        public required string HexColourCode { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ICollection<CalendarEvent> CalendarEvents { get; set; } = null!;
    }
}
