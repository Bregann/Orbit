using Newtonsoft.Json;

namespace Orbit.Domain.DTOs.Finance.Banking
{
    public class GoCardlessAccessTokenResponse
    {
        [JsonProperty("access")]
        public string AccessToken { get; set; } = "";

        [JsonProperty("access_expires")]
        public int AccessExpires { get; set; }

        [JsonProperty("refresh")]
        public string RefreshToken { get; set; } = "";

        [JsonProperty("refresh_expires")]
        public int RefreshExpires { get; set; }
    }
}
