using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Finance.Subscriptions
{
    public class UpdateSubscriptionRequest
    {
        public required int Id { get; set; }
        public required string SubscriptionName { get; set; }
        public required long SubscriptionAmount { get; set; }
        public required int BillingDay { get; set; }
        public required SubscriptionBillingFrequencyType BillingFrequency { get; set; }
    }
}
