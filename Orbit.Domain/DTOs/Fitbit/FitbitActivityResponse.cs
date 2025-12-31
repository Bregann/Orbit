using System.Text.Json.Serialization;

namespace Orbit.Domain.DTOs.Fitbit
{
    public class FitbitActivityResponse
    {
        [JsonPropertyName("summary")]
        public FitbitActivitySummary? Summary { get; set; }
    }

    public class FitbitActivitySummary
    {
        [JsonPropertyName("steps")]
        public int Steps { get; set; }

        [JsonPropertyName("caloriesOut")]
        public int CaloriesOut { get; set; }

        [JsonPropertyName("distances")]
        public List<FitbitDistance>? Distances { get; set; }

        [JsonPropertyName("activeMinutes")]
        public int ActiveMinutes { get; set; }

        [JsonPropertyName("sedentaryMinutes")]
        public int SedentaryMinutes { get; set; }

        [JsonPropertyName("lightlyActiveMinutes")]
        public int LightlyActiveMinutes { get; set; }

        [JsonPropertyName("fairlyActiveMinutes")]
        public int FairlyActiveMinutes { get; set; }

        [JsonPropertyName("veryActiveMinutes")]
        public int VeryActiveMinutes { get; set; }

        [JsonPropertyName("floors")]
        public int Floors { get; set; }
    }

    public class FitbitDistance
    {
        [JsonPropertyName("activity")]
        public string Activity { get; set; } = string.Empty;

        [JsonPropertyName("distance")]
        public double Distance { get; set; }
    }
}
