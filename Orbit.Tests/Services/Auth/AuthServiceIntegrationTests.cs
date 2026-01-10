using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Auth.Requests;
using Orbit.Domain.Services;
using Orbit.Tests.Infrastructure;
using System.Data;

namespace Orbit.Tests.Services.Auth
{
    [TestFixture]
    public class AuthServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private AuthService _authService = null!;

        protected override async Task CustomSetUp()
        {
            // Set required environment variables for JWT token generation
            Environment.SetEnvironmentVariable("JwtKey", "TestJwtKeyForAuthServiceIntegrationTestsThatIsLongEnoughForHmacSha256");
            Environment.SetEnvironmentVariable("JwtValidIssuer", "TestIssuer");
            Environment.SetEnvironmentVariable("JwtValidAudience", "TestAudience");

            _authService = new AuthService(DbContext);
            await Task.CompletedTask;
        }

        protected override async Task CustomTearDown()
        {
            Environment.SetEnvironmentVariable("JwtKey", null);
            Environment.SetEnvironmentVariable("JwtValidIssuer", null);
            Environment.SetEnvironmentVariable("JwtValidAudience", null);
            await Task.CompletedTask;
        }

        [Test]
        public async Task RegisterUser_ShouldCreateNewUser()
        {
            // Arrange
            var request = new RegisterUserRequest
            {
                Username = "newuser",
                Password = "Password123!",
                FirstName = "New",
                Email = "newuser@test.com"
            };

            // Act
            await _authService.RegisterUser(request);

            // Assert
            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Username == "newuser");
            Assert.That(user, Is.Not.Null);
            Assert.That(user.Username, Is.EqualTo("newuser"));
            Assert.That(user.FirstName, Is.EqualTo("New"));
            Assert.That(user.Email, Is.EqualTo("newuser@test.com"));
            Assert.That(user.PasswordHash, Is.Not.Empty);
            Assert.That(user.PasswordHash, Is.Not.EqualTo("Password123!"));
        }

        [Test]
        public async Task RegisterUser_ShouldTrimAndLowercaseUsername()
        {
            // Arrange
            var request = new RegisterUserRequest
            {
                Username = "  NewUser  ",
                Password = "Password123!",
                FirstName = "  Test  ",
                Email = "  test@test.com  "
            };

            // Act
            await _authService.RegisterUser(request);

            // Assert
            var user = await DbContext.Users.FirstOrDefaultAsync(u => u.Username == "newuser");
            Assert.That(user, Is.Not.Null);
            Assert.That(user.Username, Is.EqualTo("newuser"));
            Assert.That(user.FirstName, Is.EqualTo("Test"));
            Assert.That(user.Email, Is.EqualTo("test@test.com"));
        }

        [Test]
        public async Task RegisterUser_ShouldThrowDuplicateNameException_WhenUsernameExists()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "existinguser");

            var request = new RegisterUserRequest
            {
                Username = "existinguser",
                Password = "Password123!",
                FirstName = "Test",
                Email = "different@test.com"
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<DuplicateNameException>(async () =>
                await _authService.RegisterUser(request));

            Assert.That(exception.Message, Does.Contain("User already exists"));
        }

        [Test]
        public async Task RegisterUser_ShouldThrowDuplicateNameException_WhenEmailExists()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "existinguser");

            var request = new RegisterUserRequest
            {
                Username = "differentuser",
                Password = "Password123!",
                FirstName = "Test",
                Email = "existinguser@test.com"
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<DuplicateNameException>(async () =>
                await _authService.RegisterUser(request));

            Assert.That(exception.Message, Does.Contain("User already exists"));
        }

        [Test]
        public async Task LoginUser_ShouldReturnTokens_WhenCredentialsAreValid()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var request = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginUser(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AccessToken, Is.Not.Empty);
            Assert.That(result.RefreshToken, Is.Not.Empty);
        }

        [Test]
        public async Task LoginUser_ShouldCreateRefreshToken_InDatabase()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var request = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginUser(request);

            // Assert
            var refreshToken = await DbContext.UserRefreshTokens
                .FirstOrDefaultAsync(t => t.Token == result.RefreshToken);

            Assert.That(refreshToken, Is.Not.Null);
            Assert.That(refreshToken.IsRevoked, Is.False);
            Assert.That(refreshToken.ExpiresAt, Is.GreaterThan(DateTime.UtcNow));
            Assert.That(refreshToken.ExpiresAt, Is.LessThanOrEqualTo(DateTime.UtcNow.AddDays(7).AddMinutes(1)));
        }

        [Test]
        public async Task LoginUser_ShouldBeCaseInsensitive_ForEmail()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var request = new LoginUserRequest
            {
                Email = "TESTUSER@TEST.COM",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginUser(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AccessToken, Is.Not.Empty);
            Assert.That(result.RefreshToken, Is.Not.Empty);
        }

        [Test]
        public async Task LoginUser_ShouldThrowKeyNotFoundException_WhenUserDoesNotExist()
        {
            // Arrange
            var request = new LoginUserRequest
            {
                Email = "nonexistent@test.com",
                Password = "Password123!"
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _authService.LoginUser(request));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task LoginUser_ShouldThrowUnauthorizedAccessException_WhenPasswordIsInvalid()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var request = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "WrongPassword!"
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _authService.LoginUser(request));

            Assert.That(exception.Message, Does.Contain("Invalid password"));
        }

        [Test]
        public async Task RefreshToken_ShouldReturnNewTokens_WhenRefreshTokenIsValid()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var loginRequest = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };
            var loginResult = await _authService.LoginUser(loginRequest);

            // Add a small delay to ensure different expiry time in JWT
            await Task.Delay(1100);

            // Act
            var result = await _authService.RefreshToken(loginResult.RefreshToken);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AccessToken, Is.Not.Empty);
            Assert.That(result.RefreshToken, Is.Not.Empty);
            Assert.That(result.RefreshToken, Is.Not.EqualTo(loginResult.RefreshToken));

            // Verify the access token is valid JWT
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result.AccessToken);
            Assert.That(token.Claims.Any(), Is.True);
        }

        [Test]
        public async Task RefreshToken_ShouldRevokeOldToken()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var loginRequest = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };
            var loginResult = await _authService.LoginUser(loginRequest);

            // Act
            await _authService.RefreshToken(loginResult.RefreshToken);

            // Assert
            DbContext.ChangeTracker.Clear();
            var oldToken = await DbContext.UserRefreshTokens
                .FirstOrDefaultAsync(t => t.Token == loginResult.RefreshToken);

            Assert.That(oldToken, Is.Not.Null);
            Assert.That(oldToken.IsRevoked, Is.True);
        }

        [Test]
        public async Task RefreshToken_ShouldCreateNewRefreshToken_InDatabase()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var loginRequest = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };
            var loginResult = await _authService.LoginUser(loginRequest);

            // Act
            var result = await _authService.RefreshToken(loginResult.RefreshToken);

            // Assert
            var newToken = await DbContext.UserRefreshTokens
                .FirstOrDefaultAsync(t => t.Token == result.RefreshToken);

            Assert.That(newToken, Is.Not.Null);
            Assert.That(newToken.IsRevoked, Is.False);
            Assert.That(newToken.ExpiresAt, Is.GreaterThan(DateTime.UtcNow));
        }

        [Test]
        public async Task RefreshToken_ShouldThrowKeyNotFoundException_WhenTokenDoesNotExist()
        {
            // Arrange
            var invalidToken = "InvalidTokenThatDoesNotExist";

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _authService.RefreshToken(invalidToken));

            Assert.That(exception.Message, Does.Contain("Token not found"));
        }

        [Test]
        public async Task RefreshToken_ShouldThrowUnauthorizedAccessException_WhenTokenIsExpired()
        {
            // Arrange
            var user = await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var expiredToken = new Domain.Database.Models.UserRefreshToken
            {
                Token = "ExpiredToken123",
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(-1),
                IsRevoked = false
            };

            DbContext.UserRefreshTokens.Add(expiredToken);
            await DbContext.SaveChangesAsync();

            // Act & Assert
            var exception = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _authService.RefreshToken(expiredToken.Token));

            Assert.That(exception.Message, Does.Contain("Refresh token expired"));
        }

        [Test]
        public async Task RefreshToken_ShouldThrowUnauthorizedAccessException_WhenTokenIsRevoked()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var loginRequest = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };

            var loginResult = await _authService.LoginUser(loginRequest);

            // Use the refresh token once to revoke it
            await _authService.RefreshToken(loginResult.RefreshToken);

            // Act & Assert - Try to use the same (now revoked) token again
            var exception = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _authService.RefreshToken(loginResult.RefreshToken));

            Assert.That(exception.Message, Does.Contain("revoked"));
        }

        [Test]
        public async Task MultipleUsers_ShouldHaveIndependentRefreshTokens()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "user1", "Password123!");
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "user2", "Password123!");

            var login1 = await _authService.LoginUser(new LoginUserRequest
            {
                Email = "user1@test.com",
                Password = "Password123!"
            });

            var login2 = await _authService.LoginUser(new LoginUserRequest
            {
                Email = "user2@test.com",
                Password = "Password123!"
            });

            // Act
            var refresh1 = await _authService.RefreshToken(login1.RefreshToken);
            var refresh2 = await _authService.RefreshToken(login2.RefreshToken);

            // Assert
            Assert.That(refresh1.AccessToken, Is.Not.EqualTo(refresh2.AccessToken));
            Assert.That(refresh1.RefreshToken, Is.Not.EqualTo(refresh2.RefreshToken));

            var user1Tokens = await DbContext.UserRefreshTokens
                .Where(t => t.User.Username == "user1")
                .ToListAsync();
            var user2Tokens = await DbContext.UserRefreshTokens
                .Where(t => t.User.Username == "user2")
                .ToListAsync();

            Assert.That(user1Tokens.Count, Is.EqualTo(2)); // Original + refreshed
            Assert.That(user2Tokens.Count, Is.EqualTo(2)); // Original + refreshed
        }

        [Test]
        public async Task AccessToken_ShouldContainUserClaims()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser", "Password123!");

            var request = new LoginUserRequest
            {
                Email = "testuser@test.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginUser(request);

            // Assert
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result.AccessToken);

            var usernameClaim = token.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name);
            var userIdClaim = token.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

            Assert.That(usernameClaim, Is.Not.Null);
            Assert.That(usernameClaim.Value, Is.EqualTo("testuser"));
            Assert.That(userIdClaim, Is.Not.Null);
            Assert.That(userIdClaim.Value, Is.Not.Empty);
        }
    }
}
