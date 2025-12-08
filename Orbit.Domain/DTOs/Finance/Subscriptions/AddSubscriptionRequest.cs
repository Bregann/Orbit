using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Finance.Subscriptions
{
    public class AddSubscriptionRequest
    {
        public required string SubscriptionName { get; set; }
        public required long SubscriptionAmount { get; set; }
        public required int BillingDay { get; set; }
        public int? BillingMonth { get; set; }
        public required SubscriptionBillingFrequencyType BillingFrequency { get; set; }
    }
}
