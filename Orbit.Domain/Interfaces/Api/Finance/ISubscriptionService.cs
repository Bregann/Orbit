using Orbit.Domain.DTOs.Finance.Subscriptions;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface ISubscriptionService
    {
        Task AddSubscription(AddSubscriptionRequest request);
        Task DeleteSubscription(int id);
        Task<GetSubscriptionsDto> GetSubscriptions();
        Task UpdateSubscription(UpdateSubscriptionRequest request);
    }
}
