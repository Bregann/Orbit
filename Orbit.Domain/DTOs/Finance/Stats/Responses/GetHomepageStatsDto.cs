namespace Orbit.Domain.DTOs.Finance.Stats.Responses
{
    public class GetHomepageStatsDto
    {
        public required decimal MoneyIn { get; set; }
        public required decimal MoneySpent { get; set; }
        public required decimal MoneyLeft { get; set; }
        public required decimal TotalInSavings { get; set; }
    }
}
