using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Finance.Subscriptions
{
    public class GetSubscriptionsDto
    {
        public required SubscriptionItem[] Subscriptions { get; set; }
    }

    public class SubscriptionItem
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required decimal Amount { get; set; }
        public required decimal MonthlyAmount { get; set; }
        public required int BillingDay { get; set; }
        public int? BillingMonth { get; set; }
        public required SubscriptionBillingFrequencyType BillingFrequency { get; set; }
        public required DateTime NextBillingDate { get; set; }
    }
}
