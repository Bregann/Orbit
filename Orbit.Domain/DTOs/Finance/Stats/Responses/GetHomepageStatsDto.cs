namespace Orbit.Domain.DTOs.Finance.Stats.Responses
{
    public class GetHomepageStatsDto
    {
        public required string MoneyIn { get; set; }
        public required string MoneySpent { get; set; }
        public required string MoneyLeft { get; set; }
        public required string TotalInSavings { get; set; }
        public required string TotalInSpendingPots { get; set; }
    }
}
