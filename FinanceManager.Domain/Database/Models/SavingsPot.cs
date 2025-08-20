using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceManager.Domain.Database.Models
{
    public class SavingsPot
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string PotName { get; set; }

        [Required]
        public required long PotAmount { get; set; }

        [Required]
        public required long AmountToAdd { get; set; }
    }
}
