namespace Orbit.Domain.DTOs.Auth.Requests
{
    public class LoginUserRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public bool IsMobile { get; set; } = false;
    }
}
