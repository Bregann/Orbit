using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceManager.Domain.Database.Models
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
    }
}