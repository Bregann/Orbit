namespace Orbit.Domain.DTOs.Calendar
{
    public class DeleteCalendarEventRequest
    {
        public required int EventId { get; set; }
        public required DateTime? InstanceDate { get; set; }
    }
}
