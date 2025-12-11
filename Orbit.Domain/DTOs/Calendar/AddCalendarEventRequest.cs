namespace Orbit.Domain.DTOs.Calendar
{
    public class AddCalendarEventRequest
    {
        public required string EventName { get; set; }
        public required string EventLocation { get; set; }
        public required string Description { get; set; }
        public required DateTime StartTime { get; set; }
        public required DateTime EndTime { get; set; }
        public required bool IsAllDay { get; set; }
        public required int CalendarEventTypeId { get; set; }
        public string? RecurrenceRule { get; set; }
    }
}
