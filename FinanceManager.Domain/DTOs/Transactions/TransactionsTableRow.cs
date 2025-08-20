namespace FinanceManager.Domain.DTOs.Transactions
{
    public class TransactionsTableRow
    {
        public required string Id { get; set; }
        public required string MerchantName { get; set; }
        public required string IconUrl { get; set; }
        public required string TransactionAmount { get; set; }
        public required DateTime TransactionDate { get; set; }
        public int? PotId { get; set; }
    }
}