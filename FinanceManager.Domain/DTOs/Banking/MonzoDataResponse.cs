using Newtonsoft.Json;

namespace FinanceManager.Domain.DTOs.Banking
{
    public class MonzoDataResponse
    {
        [JsonProperty("transactions")]
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }

    public class Transaction
    {
        [JsonProperty("id")]
        public string Id { get; set; } = "";

        [JsonProperty("created")]
        public DateTimeOffset Created { get; set; }

        [JsonProperty("amount")]
        public long Amount { get; set; }

        [JsonProperty("merchant")]
        public Merchant Merchant { get; set; } = new Merchant();
    }

    public partial class Merchant
    {
        [JsonProperty("name")]
        public string Name { get; set; } = "";

        [JsonProperty("logo")]
        public string Logo { get; set; } = "";
    }
}
