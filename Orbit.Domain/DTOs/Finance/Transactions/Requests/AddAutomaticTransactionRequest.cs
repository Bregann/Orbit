namespace Orbit.Domain.DTOs.Finance.Transactions.Requests
{
    public class AddAutomaticTransactionRequest
    {
        public string MerchantName { get; set; } = string.Empty;
        public int PotId { get; set; }
    }
}
