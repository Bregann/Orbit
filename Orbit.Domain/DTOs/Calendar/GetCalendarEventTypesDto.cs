namespace Orbit.Domain.DTOs.Calendar
{
    public class GetCalendarEventTypesDto
    {
        public required CalendarEventTypeItem[] EventTypes { get; set; }
    }

    public class CalendarEventTypeItem
    {
        public required int Id { get; set; }
        public required string EventTypeName { get; set; }
        public required string HexColourCode { get; set; }
    }
}
