namespace Orbit.Domain.DTOs.Fitbit
{
    public class FitbitCallbackRequest
    {
        public required string Code { get; set; }
        public string? CodeVerifier { get; set; }
    }
}
