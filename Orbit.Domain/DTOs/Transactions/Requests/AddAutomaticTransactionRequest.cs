namespace Orbit.Domain.DTOs.Transactions.Requests
{
    public class AddAutomaticTransactionRequest
    {
        public string MerchantName { get; set; } = string.Empty;
        public int PotId { get; set; }
    }
}
