namespace Orbit.Domain.DTOs.Finance.Transactions.Responses
{
    public class GetAutomaticTransactionsDto
    {
        public required AutomaticTransaction[] AutomaticTransactions { get; set; }
    }

    public class AutomaticTransaction
    {
        public required int Id { get; set; }
        public required string MerchantName { get; set; }
        public required int? PotId { get; set; }
        public required bool IsSubscription { get; set; }
    }
}
