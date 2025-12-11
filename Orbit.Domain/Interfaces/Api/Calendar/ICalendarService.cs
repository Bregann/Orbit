using Orbit.Domain.DTOs.Calendar;

namespace Orbit.Domain.Interfaces.Api.Calendar
{
    public interface ICalendarService
    {
        Task AddCalendarEvent(AddCalendarEventRequest request);
        Task AddCalendarEventType(AddCalendarEventTypeRequest request);
        Task DeleteCalendarEvent(DeleteCalendarEventRequest request);
        Task EditCalendarEvent(EditCalendarEventRequest request);
        Task<GetCalendarEventsDto> GetCalendarEvents();
        Task<GetCalendarEventTypesDto> GetCalendarEventTypes();
    }
}
