using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class HistoricSavingsPotData
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required int PotId { get; set; }

        [ForeignKey(nameof(PotId))]
        public virtual SavingsPot Pot { get; set; } = null!;

        [Required]
        public required decimal PotAmount { get; set; }

        [Required]
        public required decimal AmountSaved { get; set; }

        [Required]
        public required int HistoricMonthlyDataId { get; set; }

        [ForeignKey(nameof(HistoricMonthlyDataId))]
        public virtual HistoricMonthlyData HistoricMonthlyData { get; set; } = null!;
    }
}
