namespace Orbit.Domain.DTOs.Finance.HistoricData
{
    public class GetHistoricMonthDataDto
    {
        public required decimal TotalSpent { get; set; }
        public required decimal TotalSaved { get; set; }
        public required decimal AmountLeftOver { get; set; }
        public required MonthlySpendingDataBreakdown SpendingDataBreakdown { get; set; }
        public required TopSpendingMerchantsData[] TopSpendingMerchants { get; set; }
        public required TopTransactionsData[] TopTransactions { get; set; }
        public required SpendingPerDayData[] SpendingPerDay { get; set; }
    }

    public class MonthlySpendingDataBreakdown
    {
        public required PotSpendingData[] PotSpendings { get; set; }
    }

    public class TopSpendingMerchantsData
    {
        public required string MerchantName { get; set; }
        public required int TransactionsCount { get; set; }
        public required decimal AmountSpent { get; set; }
    }

    public class TopTransactionsData
    {
        public required string MerchantName { get; set; }
        public required string TransactionDate { get; set; }
        public required decimal AmountSpent { get; set; }
        public string? PotName { get; set; }
    }

    public class SpendingPerDayData
    {
        public required string Date { get; set; }
        public required decimal AmountSpent { get; set; }
    }

    public class PotSpendingData
    {
        public required string PotName { get; set; }
        public required decimal AmountSpent { get; set; }
        public required decimal PercentageOfTotalSpent { get; set; }
    }
}
