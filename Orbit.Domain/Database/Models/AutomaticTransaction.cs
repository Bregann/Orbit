using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class AutomaticTransaction
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string MerchantName { get; set; }

        public int? PotId { get; set; }

        [ForeignKey(nameof(PotId))]
        public virtual SpendingPot? Pot { get; set; }

        public bool IsSubscription { get; set; } = false;
    }
}
