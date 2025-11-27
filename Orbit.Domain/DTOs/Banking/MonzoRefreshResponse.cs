using Newtonsoft.Json;

namespace Orbit.Domain.DTOs.Banking
{
    public class MonzoRefreshResponse
    {
        [JsonProperty("access_token")]
        public required string AccessToken { get; set; }

        [JsonProperty("client_id")]
        public required string ClientId { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonProperty("refresh_token")]
        public required string RefreshToken { get; set; }

        [JsonProperty("token_type")]
        public required string TokenType { get; set; }

        [JsonProperty("user_id")]
        public required string UserId { get; set; }
    }
}
