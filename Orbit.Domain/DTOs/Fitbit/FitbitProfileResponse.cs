using System.Text.Json.Serialization;

namespace Orbit.Domain.DTOs.Fitbit
{
    public class FitbitProfileResponse
    {
        [JsonPropertyName("user")]
        public FitbitUser? User { get; set; }
    }

    public class FitbitUser
    {
        [JsonPropertyName("encodedId")]
        public string EncodedId { get; set; } = string.Empty;

        [JsonPropertyName("displayName")]
        public string DisplayName { get; set; } = string.Empty;

        [JsonPropertyName("avatar")]
        public string Avatar { get; set; } = string.Empty;

        [JsonPropertyName("averageDailySteps")]
        public int AverageDailySteps { get; set; }

        [JsonPropertyName("memberSince")]
        public string MemberSince { get; set; } = string.Empty;
    }
}
