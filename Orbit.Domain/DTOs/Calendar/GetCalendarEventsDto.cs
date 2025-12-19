namespace Orbit.Domain.DTOs.Calendar
{
    public class GetCalendarEventsDto
    {
        public required EventEntry[] Events { get; set; }
        public required EventExceptionEntry[] EventExceptions { get; set; }
    }

    public class EventEntry
    {
        public required int Id { get; set; }
        public required string EventName { get; set; }
        public required string EventLocation { get; set; }
        public string? Description { get; set; }
        public required DateTime StartTime { get; set; }
        public required DateTime EndTime { get; set; }
        public required bool IsAllDay { get; set; }
        public string? RecurrenceRule { get; set; }
        public required int CalendarEventTypeId { get; set; }
        public required string CalendarEventTypeName { get; set; }
        public required string CalendarEventTypeColour { get; set; }
        public int? DocumentId { get; set; } = null;
        public string? DocumentFileName { get; set; } = null;
        public string? DocumentFileType { get; set; } = null;
    }

    public class EventExceptionEntry
    {
        public required int Id { get; set; }
        public required int CalendarEventId { get; set; }
        public required DateTime ExceptionDate { get; set; }
    }
}
