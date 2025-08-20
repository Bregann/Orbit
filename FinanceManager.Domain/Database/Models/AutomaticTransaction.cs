using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceManager.Domain.Database.Models
{
    public class AutomaticTransaction
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string MerchantName { get; set; }

        [Required]
        public required int PotId { get; set; }

        [ForeignKey(nameof(PotId))]
        public virtual SpendingPot Pot { get; set; } = null!;
    }
}