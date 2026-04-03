using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class GoCardlessBankConnection
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public required string RequisitionId { get; set; }

        public required string InstitutionId { get; set; }

        public required string InstitutionName { get; set; }

        public string AccountId { get; set; } = "";

        public string? AccountName { get; set; }

        public string AgreementId { get; set; } = "";

        public required DateTime CreatedAt { get; set; }

        public required DateTime ExpiresAt { get; set; }

        public required string Status { get; set; }

        public DateTime? LastSuccessfulSync { get; set; }

        public string? LastSyncError { get; set; }
    }
}
