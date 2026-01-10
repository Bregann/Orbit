using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Calendar;
using Orbit.Domain.Services.Calendar;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Calendar
{
    [TestFixture]
    public class CalendarServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private CalendarService _calendarService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestCalendarData(DbContext);

            _calendarService = new CalendarService(DbContext);
        }

        [Test]
        public async Task GetCalendarEvents_ShouldReturnAllEvents()
        {
            // Act
            var result = await _calendarService.GetCalendarEvents();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Events, Is.Not.Empty);
            Assert.That(result.Events.Any(e => e.EventName == "Test Meeting"), Is.True);
        }

        [Test]
        public async Task GetCalendarEvents_ShouldReturnEventExceptions()
        {
            // Arrange
            var eventId = DbContext.CalendarEvents.First().Id;
            await DbContext.CalendarEventExceptions.AddAsync(new Domain.Database.Models.CalendarEventException
            {
                CalendarEventId = eventId,
                ExceptionDate = DateTime.UtcNow.AddDays(5)
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _calendarService.GetCalendarEvents();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.EventExceptions, Is.Not.Empty);
            Assert.That(result.EventExceptions.Any(e => e.CalendarEventId == eventId), Is.True);
        }

        [Test]
        public async Task GetCalendarEventTypes_ShouldReturnAllEventTypes()
        {
            // Act
            var result = await _calendarService.GetCalendarEventTypes();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.EventTypes, Is.Not.Empty);
            Assert.That(result.EventTypes.Any(t => t.EventTypeName == "Test Work"), Is.True);
            Assert.That(result.EventTypes.Any(t => t.EventTypeName == "Test Personal"), Is.True);
        }

        [Test]
        public async Task AddCalendarEvent_ShouldCreateNewEvent()
        {
            // Arrange
            var request = new AddCalendarEventRequest
            {
                EventName = "New Test Event",
                EventLocation = "Test Location",
                Description = "Event created by test",
                StartTime = DateTime.UtcNow.AddDays(2),
                EndTime = DateTime.UtcNow.AddDays(2).AddHours(2),
                IsAllDay = false,
                CalendarEventTypeId = 1,
                RecurrenceRule = null,
                DocumentId = null
            };

            // Act
            await _calendarService.AddCalendarEvent(request);

            // Assert
            var events = await DbContext.CalendarEvents.ToListAsync();
            var newEvent = events.FirstOrDefault(e => e.EventName == "New Test Event");

            Assert.That(newEvent, Is.Not.Null);
            Assert.That(newEvent.EventLocation, Is.EqualTo("Test Location"));
            Assert.That(newEvent.Description, Is.EqualTo("Event created by test"));
            Assert.That(newEvent.IsAllDay, Is.False);
            Assert.That(newEvent.CalendarEventTypeId, Is.EqualTo(1));
        }

        [Test]
        public async Task AddCalendarEvent_WithRecurrenceRule_ShouldCreateRecurringEvent()
        {
            // Arrange
            var request = new AddCalendarEventRequest
            {
                EventName = "Recurring Test Event",
                EventLocation = "Office",
                Description = "Weekly meeting",
                StartTime = DateTime.UtcNow.AddDays(1),
                EndTime = DateTime.UtcNow.AddDays(1).AddHours(1),
                IsAllDay = false,
                CalendarEventTypeId = 1,
                RecurrenceRule = "FREQ=WEEKLY;BYDAY=MO",
                DocumentId = null
            };

            // Act
            await _calendarService.AddCalendarEvent(request);

            // Assert
            var newEvent = await DbContext.CalendarEvents.FirstOrDefaultAsync(e => e.EventName == "Recurring Test Event");

            Assert.That(newEvent, Is.Not.Null);
            Assert.That(newEvent.RecurrenceRule, Is.EqualTo("FREQ=WEEKLY;BYDAY=MO"));
        }

        [Test]
        public async Task AddCalendarEvent_WithInvalidDocumentId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var request = new AddCalendarEventRequest
            {
                EventName = "Event with document",
                EventLocation = "Test Location",
                Description = "Event with invalid document",
                StartTime = DateTime.UtcNow.AddDays(1),
                EndTime = DateTime.UtcNow.AddDays(1).AddHours(1),
                IsAllDay = false,
                CalendarEventTypeId = 1,
                RecurrenceRule = null,
                DocumentId = 99999
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _calendarService.AddCalendarEvent(request));

            Assert.That(exception.Message, Does.Contain("Document with ID 99999 not found"));
        }

        [Test]
        public async Task AddCalendarEvent_WithValidDocumentId_ShouldCreateEventWithDocument()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestDocuments(DbContext);
            var document = await DbContext.Documents.FirstAsync();

            var request = new AddCalendarEventRequest
            {
                EventName = "Event with valid document",
                EventLocation = "Test Location",
                Description = "Event linked to document",
                StartTime = DateTime.UtcNow.AddDays(1),
                EndTime = DateTime.UtcNow.AddDays(1).AddHours(1),
                IsAllDay = false,
                CalendarEventTypeId = 1,
                RecurrenceRule = null,
                DocumentId = document.Id
            };

            // Act
            await _calendarService.AddCalendarEvent(request);

            // Assert
            var newEvent = await DbContext.CalendarEvents
                .FirstOrDefaultAsync(e => e.EventName == "Event with valid document");

            Assert.That(newEvent, Is.Not.Null);
            Assert.That(newEvent.DocumentId, Is.EqualTo(document.Id));
            Assert.That(newEvent.EventLocation, Is.EqualTo("Test Location"));
        }

        [Test]
        public async Task AddCalendarEventType_ShouldCreateNewEventType()
        {
            // Arrange
            var request = new AddCalendarEventTypeRequest
            {
                EventTypeName = "New Event Type",
                HexColourCode = "#FF00FF"
            };

            // Act
            await _calendarService.AddCalendarEventType(request);

            // Assert
            var eventType = await DbContext.CalendarEventTypes
                .FirstOrDefaultAsync(t => t.EventTypeName == "New Event Type");

            Assert.That(eventType, Is.Not.Null);
            Assert.That(eventType.HexColourCode, Is.EqualTo("#FF00FF"));
        }

        [Test]
        public async Task EditCalendarEvent_ShouldUpdateEvent()
        {
            // Arrange
            var existingEvent = DbContext.CalendarEvents.First();
            var request = new EditCalendarEventRequest
            {
                EventId = existingEvent.Id,
                EventName = "Updated Event Name",
                EventLocation = "Updated Location",
                Description = "Updated description",
                StartTime = DateTime.UtcNow.AddDays(3),
                EndTime = DateTime.UtcNow.AddDays(3).AddHours(2),
                IsAllDay = true,
                CalendarEventTypeId = 2,
                RecurrenceRule = "FREQ=DAILY"
            };

            // Act
            await _calendarService.EditCalendarEvent(request);

            // Assert
            var updatedEvent = await DbContext.CalendarEvents.FindAsync(existingEvent.Id);

            Assert.That(updatedEvent, Is.Not.Null);
            Assert.That(updatedEvent.EventName, Is.EqualTo("Updated Event Name"));
            Assert.That(updatedEvent.EventLocation, Is.EqualTo("Updated Location"));
            Assert.That(updatedEvent.Description, Is.EqualTo("Updated description"));
            Assert.That(updatedEvent.IsAllDay, Is.True);
            Assert.That(updatedEvent.CalendarEventTypeId, Is.EqualTo(2));
            Assert.That(updatedEvent.RecurrenceRule, Is.EqualTo("FREQ=DAILY"));
        }

        [Test]
        public async Task EditCalendarEvent_ShouldThrowKeyNotFoundException_WhenEventNotFound()
        {
            // Arrange
            var request = new EditCalendarEventRequest
            {
                EventId = 99999,
                EventName = "Updated Event",
                EventLocation = "Location",
                Description = "Description",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1),
                IsAllDay = false,
                CalendarEventTypeId = 1,
                RecurrenceRule = null
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _calendarService.EditCalendarEvent(request));

            Assert.That(exception.Message, Does.Contain("Calendar event with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteCalendarEvent_ShouldRemoveEvent()
        {
            // Arrange
            var existingEvent = DbContext.CalendarEvents.First();
            var eventId = existingEvent.Id;
            var initialCount = await DbContext.CalendarEvents.CountAsync();

            var request = new DeleteCalendarEventRequest
            {
                EventId = eventId,
                InstanceDate = null
            };

            // Act
            await _calendarService.DeleteCalendarEvent(request);

            // Assert
            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var deletedEvent = await DbContext.CalendarEvents.FindAsync(eventId);
            var finalCount = await DbContext.CalendarEvents.CountAsync();
            Assert.That(deletedEvent, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteCalendarEvent_WithInstanceDate_ShouldCreateException()
        {
            // Arrange
            var existingEvent = DbContext.CalendarEvents.First();
            var exceptionDate = DateTime.UtcNow.AddDays(7);

            var request = new DeleteCalendarEventRequest
            {
                EventId = existingEvent.Id,
                InstanceDate = exceptionDate
            };

            // Act
            await _calendarService.DeleteCalendarEvent(request);

            // Assert
            var eventStillExists = await DbContext.CalendarEvents.FindAsync(existingEvent.Id);
            var exception = await DbContext.CalendarEventExceptions
                .FirstOrDefaultAsync(e => e.CalendarEventId == existingEvent.Id && e.ExceptionDate.Date == exceptionDate.Date);

            Assert.That(eventStillExists, Is.Not.Null);
            Assert.That(exception, Is.Not.Null);
            Assert.That(exception.CalendarEventId, Is.EqualTo(existingEvent.Id));
        }

        [Test]
        public async Task DeleteCalendarEvent_ShouldThrowKeyNotFoundException_WhenEventNotFound()
        {
            // Arrange
            var request = new DeleteCalendarEventRequest
            {
                EventId = 99999,
                InstanceDate = null
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _calendarService.DeleteCalendarEvent(request));

            Assert.That(exception.Message, Does.Contain("Calendar event with ID 99999 not found"));
        }
    }
}
