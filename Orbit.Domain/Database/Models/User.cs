using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class User
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; } = null!;

        [Required]
        public string FirstName { get; set; } = "";

        [Required]
        public string Username { get; set; } = "";

        [Required]
        public string Email { get; set; } = "";

        [Required]
        public string PasswordHash { get; set; } = "";

        [Required]
        public string MonzoAccessToken { get; set; } = "";

        [Required]
        public string MonzoRefreshToken { get; set; } = "";

        // Fitbit OAuth tokens
        public string FitbitAccessToken { get; set; } = "";

        public string FitbitRefreshToken { get; set; } = "";

        public string FitbitUserId { get; set; } = "";

        public DateTime? FitbitTokenExpiresAt { get; set; }
    }
}
