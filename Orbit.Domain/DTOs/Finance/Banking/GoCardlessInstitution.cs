using Newtonsoft.Json;

namespace Orbit.Domain.DTOs.Finance.Banking
{
    public class GoCardlessInstitution
    {
        [JsonProperty("id")]
        public string Id { get; set; } = "";

        [JsonProperty("name")]
        public string Name { get; set; } = "";

        [JsonProperty("bic")]
        public string Bic { get; set; } = "";

        [JsonProperty("logo")]
        public string Logo { get; set; } = "";

        [JsonProperty("countries")]
        public string[] Countries { get; set; } = [];
    }
}
