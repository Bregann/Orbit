namespace Orbit.Domain.DTOs.Transactions.Requests
{
    public class UpdateTransactionRequest
    {
        public required string TransactionId { get; set; }
        public int? PotId { get; set; }
    }
}
