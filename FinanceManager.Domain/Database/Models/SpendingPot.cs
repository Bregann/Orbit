using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceManager.Domain.Database.Models
{
    public class SpendingPot
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string PotName { get; set; }

        [Required]
        public required long PotAmount { get; set; }

        [Required]
        public required long AmountToAdd { get; set; }

        [Required]
        public required long PotAmountSpent { get; set; }

        [Required]
        public required long PotAmountLeft { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ICollection<HistoricPotData> HistoricPotData { get; set; } = null!;
    }
}
