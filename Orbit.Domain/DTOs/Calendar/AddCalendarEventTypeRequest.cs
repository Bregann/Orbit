namespace Orbit.Domain.DTOs.Calendar
{
    public class AddCalendarEventTypeRequest
    {
        public required string EventTypeName { get; set; }
        public required string HexColourCode { get; set; }
    }
}
