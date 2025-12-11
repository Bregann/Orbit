using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class CalendarEventException
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int CalendarEventId { get; set; }

        [ForeignKey(nameof(CalendarEventId))]
        public virtual CalendarEvent CalendarEvent { get; set; } = null!;

        // The ORIGINAL start date of the instance you are deleting/changing.
        [Required]
        public DateTime ExceptionDate { get; set; }
    }
}
