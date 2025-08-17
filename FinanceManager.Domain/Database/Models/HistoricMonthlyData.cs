using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceManager.Domain.Database.Models
{
    public class HistoricMonthlyData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required DateTime DateAdded { get; set; }

        [Required]
        public required decimal MonthlyIncome { get; set; }

        [Required]
        public required decimal AmountSaved { get; set; }

        [Required]
        public required decimal AmountSpent { get; set; }

        [DeleteBehavior(DeleteBehavior.Cascade)]
        public virtual ICollection<HistoricPotData> HistoricPotData { get; set; } = null!;
    }
}
