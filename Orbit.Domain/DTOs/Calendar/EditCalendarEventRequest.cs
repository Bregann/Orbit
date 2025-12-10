namespace Orbit.Domain.DTOs.Calendar
{
    public class EditCalendarEventRequest
    {
        public required int EventId { get; set; }
        public string EventName { get; set; } = null!;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAllDay { get; set; }
        public string EventLocation { get; set; } = null!;
        public string? Description { get; set; }
        public required int CalendarEventTypeId { get; set; }
        public string? RecurrenceRule { get; set; }
    }
}
