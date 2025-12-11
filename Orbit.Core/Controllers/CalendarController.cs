using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Calendar;
using Orbit.Domain.Interfaces.Api.Calendar;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class CalendarController(ICalendarService calendarService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<GetCalendarEventsDto>> GetCalendarEvents()
        {
            var events = await calendarService.GetCalendarEvents();
            return Ok(events);
        }

        [HttpGet]
        public async Task<ActionResult<GetCalendarEventTypesDto>> GetCalendarEventTypes()
        {
            var eventTypes = await calendarService.GetCalendarEventTypes();
            return Ok(eventTypes);
        }

        [HttpPost]
        public async Task<ActionResult> AddCalendarEvent([FromBody] AddCalendarEventRequest request)
        {
            try
            {
                await calendarService.AddCalendarEvent(request);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddCalendarEventType([FromBody] AddCalendarEventTypeRequest request)
        {
            try
            {
                await calendarService.AddCalendarEventType(request);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteCalendarEvent([FromBody] DeleteCalendarEventRequest request)
        {
            try
            {
                await calendarService.DeleteCalendarEvent(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut]
        public async Task<ActionResult> EditCalendarEvent([FromBody] EditCalendarEventRequest request)
        {
            try
            {
                await calendarService.EditCalendarEvent(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
