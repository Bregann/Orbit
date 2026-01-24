namespace Orbit.Domain.DTOs.Finance.Transactions.Requests
{
    public class SplitTransactionRequest
    {
        public required string TransactionId { get; set; }
        public required List<TransactionSplit> Splits { get; set; }
    }

    public class TransactionSplit
    {
        public required string Id { get; set; }
        public required int PotId { get; set; }
        public required long Amount { get; set; }
    }
}
