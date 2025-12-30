namespace Orbit.Domain.DTOs.Fitbit
{
    public class FitbitConnectionStatus
    {
        public bool IsConnected { get; set; }
        public string? FitbitUserId { get; set; }
        public DateTime? TokenExpiresAt { get; set; }
    }
}
