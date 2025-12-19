using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Calendar;
using Orbit.Domain.Interfaces.Api.Calendar;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Calendar
{
    public class CalendarService(AppDbContext context) : ICalendarService
    {
        public async Task<GetCalendarEventsDto> GetCalendarEvents()
        {
            var events = await context.CalendarEvents.Select(x => new EventEntry
            {
                Id = x.Id,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                EventName = x.EventName,
                EventLocation = x.EventLocation,
                Description = x.Description,
                IsAllDay = x.IsAllDay,
                CalendarEventTypeId = x.CalendarEventTypeId,
                CalendarEventTypeName = x.CalendarEventType.EventTypeName,
                CalendarEventTypeColour = x.CalendarEventType.HexColourCode,
                RecurrenceRule = x.RecurrenceRule,
                DocumentId = x.DocumentId,
                DocumentFileName = x.Document != null ? x.Document.DocumentName : null,
                DocumentFileType = x.Document != null ? x.Document.DocumentType : null

            }).ToArrayAsync();

            var eventExceptions = await context.CalendarEventExceptions.Select(x => new EventExceptionEntry
            {
                Id = x.Id,
                CalendarEventId = x.CalendarEventId,
                ExceptionDate = x.ExceptionDate,
            }).ToArrayAsync();

            return new GetCalendarEventsDto
            {
                Events = events,
                EventExceptions = eventExceptions
            };
        }

        public async Task<GetCalendarEventTypesDto> GetCalendarEventTypes()
        {
            var eventTypes = await context.Set<CalendarEventType>()
                .Select(x => new CalendarEventTypeItem
                {
                    Id = x.Id,
                    EventTypeName = x.EventTypeName,
                    HexColourCode = x.HexColourCode
                }).ToArrayAsync();

            return new GetCalendarEventTypesDto
            {
                EventTypes = eventTypes
            };
        }

        public async Task AddCalendarEvent(AddCalendarEventRequest request)
        {
            var documentExists = await context.Documents
                .FirstOrDefaultAsync(x => x.Id == request.DocumentId) ?? throw new KeyNotFoundException($"Document with ID {request.DocumentId} not found.");

            var newEvent = new CalendarEvent
            {
                StartTime = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc),
                EndTime = DateTime.SpecifyKind(request.EndTime, DateTimeKind.Utc),
                EventName = request.EventName,
                EventLocation = request.EventLocation,
                Description = request.Description,
                IsAllDay = request.IsAllDay,
                CalendarEventTypeId = request.CalendarEventTypeId,
                RecurrenceRule = request.RecurrenceRule,
                DocumentId = request.DocumentId
            };

            await context.AddAsync(newEvent);
            await context.SaveChangesAsync();

            Log.Information($"Added new calendar event {newEvent.EventName} ({newEvent.Id})");
        }

        public async Task AddCalendarEventType(AddCalendarEventTypeRequest request)
        {
            var newEventType = new CalendarEventType
            {
                EventTypeName = request.EventTypeName,
                HexColourCode = request.HexColourCode
            };

            await context.AddAsync(newEventType);
            await context.SaveChangesAsync();

            Log.Information($"Added new calendar event type {newEventType.EventTypeName} ({newEventType.Id})");
        }

        public async Task DeleteCalendarEvent(DeleteCalendarEventRequest request)
        {
            var calendarEvent = await context.CalendarEvents
                .FirstOrDefaultAsync(x => x.Id == request.EventId);

            if (calendarEvent == null)
            {
                Log.Warning($"No calendar event found with ID {request.EventId} to delete");
                throw new KeyNotFoundException($"Calendar event with ID {request.EventId} not found.");
            }

            if (request.InstanceDate != null)
            {
                await context.CalendarEventExceptions.AddAsync(new CalendarEventException
                {
                    CalendarEventId = request.EventId,
                    ExceptionDate = DateTime.SpecifyKind(request.InstanceDate.Value, DateTimeKind.Utc)
                });

                await context.SaveChangesAsync();

                Log.Information($"Added exception for calendar event {request.EventId} on {request.InstanceDate:yyyy-MM-dd}");
                return;
            }

            var rowsAffected = await context.CalendarEvents
                .Where(x => x.Id == request.EventId)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                Log.Warning($"No calendar event found with ID {request.EventId} to delete");
                throw new KeyNotFoundException($"Calendar event with ID {request.EventId} not found.");
            }

            Log.Information($"Deleted calendar event {request.EventId}, rows affected: {rowsAffected}");
        }

        public async Task EditCalendarEvent(EditCalendarEventRequest request)
        {
            var calendarEvent = await context.CalendarEvents
                .FirstOrDefaultAsync(x => x.Id == request.EventId);

            if (calendarEvent == null)
            {
                Log.Warning($"No calendar event found with ID {request.EventId} to edit");
                throw new KeyNotFoundException($"Calendar event with ID {request.EventId} not found.");
            }

            calendarEvent.EventName = request.EventName;
            calendarEvent.StartTime = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc);
            calendarEvent.EndTime = DateTime.SpecifyKind(request.EndTime, DateTimeKind.Utc);
            calendarEvent.IsAllDay = request.IsAllDay;
            calendarEvent.EventLocation = request.EventLocation;
            calendarEvent.Description = request.Description;
            calendarEvent.CalendarEventTypeId = request.CalendarEventTypeId;
            calendarEvent.RecurrenceRule = request.RecurrenceRule;

            await context.SaveChangesAsync();

            Log.Information($"Updated calendar event {calendarEvent.EventName} ({calendarEvent.Id})");
        }
    }
}
