using Newtonsoft.Json;

namespace Orbit.Domain.DTOs.Finance.Banking
{
    public class GoCardlessRequisitionResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; } = "";

        [JsonProperty("created")]
        public DateTime Created { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; } = "";

        [JsonProperty("institution_id")]
        public string InstitutionId { get; set; } = "";

        [JsonProperty("agreement")]
        public string Agreement { get; set; } = "";

        [JsonProperty("link")]
        public string Link { get; set; } = "";

        [JsonProperty("accounts")]
        public string[] Accounts { get; set; } = [];
    }
}
