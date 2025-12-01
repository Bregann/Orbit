namespace Orbit.Domain.DTOs.Transactions.Responses
{
    public class GetAutomaticTransactionsDto
    {
        public required AutomaticTransaction[] AutomaticTransactions { get; set; }
    }

    public class AutomaticTransaction
    {
        public required int Id { get; set; }
        public required string MerchantName { get; set; }
        public required int PotId { get; set; }
    }
}
