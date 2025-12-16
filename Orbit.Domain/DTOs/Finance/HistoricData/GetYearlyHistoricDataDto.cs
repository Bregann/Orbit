namespace Orbit.Domain.DTOs.Finance.HistoricData
{
    public class GetYearlyHistoricDataDto
    {
        public required MonthlySpendingData[] MonthlySpending { get; set; }
        public required MonthlyLeftOverData[] MonthlyLeftOver { get; set; }
        public required MonthlySavingsData[] MonthlySavings { get; set; }
        public required AmountSpentPerPotData[] AmountSpentPerPot { get; set; }
        public required AmountSavedPerPotData[] AmountSavedPerPot { get; set; }
    }

    public class MonthlySpendingData
    {
        public required string Month { get; set; }
        public required decimal AmountSpent { get; set; }
    }

    public class MonthlyLeftOverData
    {
        public required string Month { get; set; }
        public required decimal AmountLeftOver { get; set; }
    }

    public class MonthlySavingsData
    {
        public required string Month { get; set; }
        public required decimal AmountSaved { get; set; }
    }

    public class AmountSpentPerPotData
    {
        public required string Month { get; set; }
        public required string PotName { get; set; }
        public required decimal TotalAmountSpent { get; set; }
    }

    public class AmountSavedPerPotData
    {
        public required string Month { get; set; }
        public required string PotName { get; set; }
        public required decimal TotalAmountSaved { get; set; }
    }
}
