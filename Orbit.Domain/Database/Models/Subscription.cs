using Orbit.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class Subscription
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string SubscriptionName { get; set; }

        [Required]
        public required long SubscriptionAmount { get; set; }

        [Required]
        public required long SubscriptionMonthlyAmount { get; set; }

        [Required]
        public required int BillingDay { get; set; }

        public int? BillingMonth { get; set; }

        [Required]
        public required SubscriptionBillingFrequencyType BillingFrequency { get; set; }
    }
}
