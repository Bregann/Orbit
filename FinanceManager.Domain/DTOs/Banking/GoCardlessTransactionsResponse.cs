using Newtonsoft.Json;

namespace FinanceManager.Domain.DTOs.Banking
{
    public class GoCardlessTransactionsResponse
    {
        [JsonProperty("transactions")]
        public Transactions Transactions { get; set; } = new Transactions();

        [JsonProperty("last_updated")]
        public DateTimeOffset LastUpdated { get; set; }
    }

    public class Transactions
    {
        [JsonProperty("booked")]
        public Booked[] Booked { get; set; } = [];
    }

    public class Booked
    {
        [JsonProperty("transactionId")]
        public string TransactionId { get; set; } = "";

        [JsonProperty("bookingDate")]
        public DateTimeOffset BookingDate { get; set; }

        [JsonProperty("bookingDateTime")]
        public DateTimeOffset BookingDateTime { get; set; }

        [JsonProperty("transactionAmount")]
        public TransactionAmount TransactionAmount { get; set; } = new TransactionAmount();

        [JsonProperty("remittanceInformationUnstructured")]
        public string RemittanceInformationUnstructured { get; set; } = "";

        [JsonProperty("proprietaryBankTransactionCode")]
        public string ProprietaryBankTransactionCode { get; set; } = "";

        [JsonProperty("internalTransactionId")]
        public string InternalTransactionId { get; set; } = "";
    }

    public class TransactionAmount
    {
        [JsonProperty("amount")]
        public string Amount { get; set; } = "";

        [JsonProperty("currency")]
        public string Currency { get; set; } = "";
    }
}