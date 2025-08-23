using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceManager.Domain.Database.Models
{
    public class Transactions
    {
        [Key]
        public required string Id { get; set; }

        [Required]
        public required bool Processed { get; set; }

        public string? ImgUrl { get; set; }

        [Required]
        public required DateTimeOffset TransactionDate { get; set; }

        [Required]
        public required string MerchantName { get; set; }

        [Required]
        public required long TransactionAmount { get; set; }

        public int? PotId { get; set; }

        [ForeignKey(nameof(PotId))]
        public virtual SpendingPot? Pot { get; set; }
    }
}
