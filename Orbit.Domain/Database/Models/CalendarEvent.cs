using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class CalendarEvent
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string EventName { get; set; }

        [Required]
        public required string EventLocation { get; set; }

        public string? Description { get; set; }

        [Required]
        public required DateTime StartTime { get; set; }

        /// <summary>
        /// The duration end time of the event.
        /// </summary>
        [Required]
        public required DateTime EndTime { get; set; }

        public string? RecurrenceRule { get; set; }

        [Required]
        public bool IsAllDay { get; set; } = false;

        // Foreign Key to CalendarEventType
        [Required]
        public required int CalendarEventTypeId { get; set; }

        [ForeignKey(nameof(CalendarEventTypeId))]
        public virtual CalendarEventType CalendarEventType { get; set; } = null!;
    }
}
