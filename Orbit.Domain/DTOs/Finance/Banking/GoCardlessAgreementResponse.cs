using Newtonsoft.Json;

namespace Orbit.Domain.DTOs.Finance.Banking
{
    public class GoCardlessAgreementResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; } = "";

        [JsonProperty("created")]
        public DateTime Created { get; set; }

        [JsonProperty("max_historical_days")]
        public int MaxHistoricalDays { get; set; }

        [JsonProperty("access_valid_for_days")]
        public int AccessValidForDays { get; set; }

        [JsonProperty("access_scope")]
        public string[] AccessScope { get; set; } = [];

        [JsonProperty("institution_id")]
        public string InstitutionId { get; set; } = "";
    }
}
