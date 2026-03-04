using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.Subscriptions;
using Orbit.Domain.Interfaces.Api.Finance;

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
            await subscriptionService.AddSubscription(request);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult> UpdateSubscription([FromBody] UpdateSubscriptionRequest request)
        {
            await subscriptionService.UpdateSubscription(request);
            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteSubscription([FromQuery] int id)
        {
            await subscriptionService.DeleteSubscription(id);
            return Ok();
        }
    }
}
