namespace Orbit.Domain.DTOs.Finance.Banking
{
    public class GoCardlessConnectionStatusDto
    {
        public bool HasActiveConnections { get; set; }
        public List<GoCardlessBankConnectionDto> Connections { get; set; } = [];
    }

    public class GoCardlessBankConnectionDto
    {
        public int Id { get; set; }
        public string InstitutionId { get; set; } = "";
        public string InstitutionName { get; set; } = "";
        public string AccountId { get; set; } = "";
        public string? AccountName { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int DaysUntilExpiry { get; set; }
        public bool IsExpiringSoon { get; set; }
        public DateTime? LastSuccessfulSync { get; set; }
        public string? LastSyncError { get; set; }
    }
}
