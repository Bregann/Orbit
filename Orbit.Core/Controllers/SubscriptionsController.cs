using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.Subscriptions;
using Orbit.Domain.Interfaces.Api.Finance;
using System.Data;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class SubscriptionsController(ISubscriptionService subscriptionService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<GetSubscriptionsDto>> GetSubscriptions()
        {
            var subscriptions = await subscriptionService.GetSubscriptions();
            return Ok(subscriptions);
        }

        [HttpPost]
        public async Task<ActionResult> AddSubscription([FromBody] AddSubscriptionRequest request)
        {
            try
            {
                await subscriptionService.AddSubscription(request);
                return Ok();
            }
            catch (DuplicateNameException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateSubscription([FromBody] UpdateSubscriptionRequest request)
        {
            try
            {
                await subscriptionService.UpdateSubscription(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteSubscription([FromQuery] int id)
        {
            try
            {
                await subscriptionService.DeleteSubscription(id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
