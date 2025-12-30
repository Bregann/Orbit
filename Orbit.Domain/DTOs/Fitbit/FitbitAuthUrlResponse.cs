namespace Orbit.Domain.DTOs.Fitbit
{
    public class FitbitAuthUrlResponse
    {
        public required string AuthorizationUrl { get; set; }
        public required string CodeVerifier { get; set; }
    }
}
