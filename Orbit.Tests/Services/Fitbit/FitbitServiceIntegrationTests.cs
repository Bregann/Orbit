using Microsoft.EntityFrameworkCore;
using Moq;
using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Interfaces.Helpers;
using Orbit.Domain.Services.Fitbit;
using Orbit.Tests.Infrastructure;
using MockFactory = Orbit.Tests.Infrastructure.MockFactory;

namespace Orbit.Tests.Services.Fitbit
{
    [TestFixture]
    public class FitbitServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private FitbitService _fitbitService = null!;
        private Mock<IFitbitApiHelper> _mockFitbitApiHelper = null!;
        private string _testUserId = null!;

        protected override async Task CustomSetUp()
        {
            var user = await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            _testUserId = user.Id;

            _mockFitbitApiHelper = MockFactory.CreateFitbitApiHelper();
            _fitbitService = new FitbitService(DbContext, _mockFitbitApiHelper.Object);
        }

        [Test]
        public void GenerateAuthorizationUrl_ShouldReturnAuthUrlAndCodeVerifier()
        {
            // Act
            var result = _fitbitService.GenerateAuthorizationUrl();

            // Assert
            Assert.That(result.authUrl, Is.Not.Null);
            Assert.That(result.codeVerifier, Is.Not.Null);
            Assert.That(result.authUrl, Does.StartWith("https://fitbit.com"));
            _mockFitbitApiHelper.Verify(x => x.GenerateAuthorizationUrl(), Times.Once);
        }

        [Test]
        public async Task ExchangeCodeForTokens_ShouldReturnTokenResponse()
        {
            // Arrange
            var code = "test_auth_code";
            var codeVerifier = "test_code_verifier";

            // Act
            var result = await _fitbitService.ExchangeCodeForTokens(code, codeVerifier);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AccessToken, Is.EqualTo("test_access_token"));
            Assert.That(result.RefreshToken, Is.EqualTo("test_refresh_token"));
            _mockFitbitApiHelper.Verify(x => x.ExchangeCodeForTokens(code, codeVerifier), Times.Once);
        }

        [Test]
        public async Task SaveFitbitTokens_ShouldSaveTokensToUser()
        {
            // Arrange
            var tokens = new FitbitTokenResponse
            {
                AccessToken = "access_token_123",
                RefreshToken = "refresh_token_123",
                UserId = "fitbit_user_123",
                ExpiresIn = 3600
            };

            // Act
            await _fitbitService.SaveFitbitTokens(_testUserId, tokens);

            // Assert
            var user = await DbContext.Users.FindAsync(_testUserId);
            Assert.That(user, Is.Not.Null);
            Assert.That(user.FitbitAccessToken, Is.EqualTo("access_token_123"));
            Assert.That(user.FitbitRefreshToken, Is.EqualTo("refresh_token_123"));
            Assert.That(user.FitbitUserId, Is.EqualTo("fitbit_user_123"));
            Assert.That(user.FitbitTokenExpiresAt, Is.Not.Null);
        }

        [Test]
        public async Task SaveFitbitTokens_ShouldThrowKeyNotFoundException_WhenUserNotFound()
        {
            // Arrange
            var tokens = new FitbitTokenResponse
            {
                AccessToken = "access_token",
                RefreshToken = "refresh_token",
                UserId = "fitbit_user",
                ExpiresIn = 3600
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _fitbitService.SaveFitbitTokens("non_existent_user", tokens));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task GetConnectionStatus_ShouldReturnConnectedStatus_WhenTokensExist()
        {
            // Arrange
            await SaveTestTokensForUser();

            // Act
            var result = await _fitbitService.GetConnectionStatus(_testUserId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.IsConnected, Is.True);
            Assert.That(result.FitbitUserId, Is.EqualTo("test_fitbit_user"));
        }

        [Test]
        public async Task GetConnectionStatus_ShouldReturnNotConnectedStatus_WhenNoTokens()
        {
            // Act
            var result = await _fitbitService.GetConnectionStatus(_testUserId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.IsConnected, Is.False);
            Assert.That(result.FitbitUserId, Is.Null.Or.Empty);
        }

        [Test]
        public async Task GetConnectionStatus_ShouldThrowKeyNotFoundException_WhenUserNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _fitbitService.GetConnectionStatus("non_existent_user"));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task DisconnectFitbit_ShouldClearTokensAndRevokeAccess()
        {
            // Arrange
            await SaveTestTokensForUser();

            // Act
            await _fitbitService.DisconnectFitbit(_testUserId);

            // Assert
            var user = await DbContext.Users.FindAsync(_testUserId);
            Assert.That(user, Is.Not.Null);
            Assert.That(user.FitbitAccessToken, Is.Empty);
            Assert.That(user.FitbitRefreshToken, Is.Empty);
            Assert.That(user.FitbitUserId, Is.Empty);
            Assert.That(user.FitbitTokenExpiresAt, Is.Null);
            _mockFitbitApiHelper.Verify(x => x.RevokeToken(It.IsAny<string>()), Times.Once);
        }

        [Test]
        public async Task DisconnectFitbit_ShouldClearTokens_EvenWhenRevokeThrows()
        {
            // Arrange
            await SaveTestTokensForUser();
            _mockFitbitApiHelper.Setup(x => x.RevokeToken(It.IsAny<string>()))
                .ThrowsAsync(new HttpRequestException("Revoke failed"));

            // Act
            await _fitbitService.DisconnectFitbit(_testUserId);

            // Assert
            var user = await DbContext.Users.FindAsync(_testUserId);
            Assert.That(user, Is.Not.Null);
            Assert.That(user.FitbitAccessToken, Is.Empty);
            Assert.That(user.FitbitRefreshToken, Is.Empty);
        }

        [Test]
        public async Task DisconnectFitbit_ShouldThrowKeyNotFoundException_WhenUserNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _fitbitService.DisconnectFitbit("non_existent_user"));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task RefreshAccessToken_ShouldUpdateTokens()
        {
            // Arrange
            await SaveTestTokensForUser();

            // Act
            var result = await _fitbitService.RefreshAccessToken(_testUserId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AccessToken, Is.EqualTo("new_access_token"));

            var user = await DbContext.Users.FindAsync(_testUserId);
            Assert.That(user, Is.Not.Null);
            Assert.That(user.FitbitAccessToken, Is.EqualTo("new_access_token"));
            Assert.That(user.FitbitRefreshToken, Is.EqualTo("new_refresh_token"));

            _mockFitbitApiHelper.Verify(x => x.RefreshAccessToken("test_refresh_token"), Times.Once);
        }

        [Test]
        public async Task RefreshAccessToken_ShouldThrowKeyNotFoundException_WhenUserNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _fitbitService.RefreshAccessToken("non_existent_user"));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task RefreshAccessToken_ShouldThrowInvalidOperationException_WhenNoRefreshToken()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _fitbitService.RefreshAccessToken(_testUserId));

            Assert.That(exception.Message, Does.Contain("No Fitbit refresh token available"));
        }

        [Test]
        public async Task GetProfile_ShouldReturnProfile()
        {
            // Arrange
            await SaveTestTokensForUser();

            // Act
            var result = await _fitbitService.GetProfile(_testUserId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.User, Is.Not.Null);
            Assert.That(result.User.DisplayName, Is.EqualTo("Test User"));
            Assert.That(result.User.AverageDailySteps, Is.EqualTo(8000));

            _mockFitbitApiHelper.Verify(x => x.GetProfile(It.IsAny<string>()), Times.Once);
        }

        [Test]
        public async Task GetProfile_ShouldThrowKeyNotFoundException_WhenUserNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _fitbitService.GetProfile("non_existent_user"));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task GetProfile_ShouldThrowInvalidOperationException_WhenNotConnected()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _fitbitService.GetProfile(_testUserId));

            Assert.That(exception.Message, Does.Contain("Fitbit is not connected"));
        }

        [Test]
        public async Task GetProfile_ShouldRefreshToken_WhenExpired()
        {
            // Arrange
            await SaveTestTokensForUser(expiresInMinutes: -10);

            // Act
            var result = await _fitbitService.GetProfile(_testUserId);

            // Assert
            Assert.That(result, Is.Not.Null);
            _mockFitbitApiHelper.Verify(x => x.RefreshAccessToken(It.IsAny<string>()), Times.Once);
            _mockFitbitApiHelper.Verify(x => x.GetProfile("new_access_token"), Times.Once);
        }

        [Test]
        public async Task GetDailyActivity_ShouldReturnActivity()
        {
            // Arrange
            await SaveTestTokensForUser();
            var date = DateTime.UtcNow.Date;

            // Act
            var result = await _fitbitService.GetDailyActivity(_testUserId, date);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Summary, Is.Not.Null);
            Assert.That(result.Summary.Steps, Is.EqualTo(10000));
            Assert.That(result.Summary.CaloriesOut, Is.EqualTo(2500));

            _mockFitbitApiHelper.Verify(x => x.GetDailyActivity(It.IsAny<string>(), date), Times.Once);
        }

        [Test]
        public async Task GetDailyActivity_ShouldThrowKeyNotFoundException_WhenUserNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _fitbitService.GetDailyActivity("non_existent_user", DateTime.UtcNow));

            Assert.That(exception.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task GetDailyActivity_ShouldThrowInvalidOperationException_WhenNotConnected()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _fitbitService.GetDailyActivity(_testUserId, DateTime.UtcNow));

            Assert.That(exception.Message, Does.Contain("Fitbit is not connected"));
        }

        [Test]
        public async Task RefreshFitbitTokens_ShouldRefreshTokensForAllConnectedUsers()
        {
            // Arrange
            await SaveTestTokensForUser();
            var user2 = await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser2");
            await SaveTestTokensForUser(user2.Id);

            // Act
            await _fitbitService.RefreshFitbitTokens();

            // Assert
            _mockFitbitApiHelper.Verify(x => x.RefreshAccessToken(It.IsAny<string>()), Times.Exactly(2));
        }

        [Test]
        public async Task RefreshFitbitTokens_ShouldContinue_WhenOneUserFails()
        {
            // Arrange
            await SaveTestTokensForUser();
            var user2 = await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser2");
            await SaveTestTokensForUser(user2.Id);

            var callCount = 0;
            _mockFitbitApiHelper.Setup(x => x.RefreshAccessToken(It.IsAny<string>()))
                .ReturnsAsync(() =>
                {
                    callCount++;
                    if (callCount == 1)
                    {
                        throw new HttpRequestException("Refresh failed");
                    }
                    return new FitbitTokenResponse
                    {
                        AccessToken = "new_access_token",
                        RefreshToken = "new_refresh_token",
                        UserId = "test_fitbit_user",
                        ExpiresIn = 3600
                    };
                });

            // Act
            await _fitbitService.RefreshFitbitTokens();

            // Assert
            _mockFitbitApiHelper.Verify(x => x.RefreshAccessToken(It.IsAny<string>()), Times.Exactly(2));
        }

        [Test]
        public async Task RecordDailyFitbitData_ShouldSaveActivityData()
        {
            // Arrange
            await SaveTestTokensForUser();

            // Act
            await _fitbitService.RecordDailyFitbitData();

            // Assert
            var fitbitData = await DbContext.FitbitData.FirstOrDefaultAsync();
            Assert.That(fitbitData, Is.Not.Null);
            Assert.That(fitbitData.StepsWalked, Is.EqualTo(10000));
            Assert.That(fitbitData.DistanceWalkedMiles, Is.GreaterThan(0));
            Assert.That(fitbitData.DateRecorded.Date, Is.EqualTo(DateTime.UtcNow.Date.AddDays(-1)));
        }

        [Test]
        public async Task RecordDailyFitbitData_ShouldContinue_WhenOneUserFails()
        {
            // Arrange
            await SaveTestTokensForUser();
            var user2 = await TestDatabaseSeedHelper.SeedTestUser(DbContext, "testuser2");
            await SaveTestTokensForUser(user2.Id);

            var callCount = 0;
            _mockFitbitApiHelper.Setup(x => x.GetDailyActivity(It.IsAny<string>(), It.IsAny<DateTime>()))
                .ReturnsAsync(() =>
                {
                    callCount++;
                    if (callCount == 1)
                    {
                        throw new HttpRequestException("API call failed");
                    }
                    return new FitbitActivityResponse
                    {
                        Summary = new FitbitActivitySummary
                        {
                            Steps = 5000,
                            Distances = new List<FitbitDistance>
                            {
                                new FitbitDistance { Activity = "total", Distance = 3.0 }
                            }
                        }
                    };
                });

            // Act
            await _fitbitService.RecordDailyFitbitData();

            // Assert
            var dataCount = await DbContext.FitbitData.CountAsync();
            Assert.That(dataCount, Is.EqualTo(1));
        }

        [Test]
        public async Task RecordDailyFitbitData_ShouldNotSaveData_WhenActivityIsNull()
        {
            // Arrange
            await SaveTestTokensForUser();
            _mockFitbitApiHelper.Setup(x => x.GetDailyActivity(It.IsAny<string>(), It.IsAny<DateTime>()))
                .ReturnsAsync((FitbitActivityResponse?)null);

            // Act
            await _fitbitService.RecordDailyFitbitData();

            // Assert
            var dataCount = await DbContext.FitbitData.CountAsync();
            Assert.That(dataCount, Is.EqualTo(0));
        }

        private async Task SaveTestTokensForUser(string? userId = null, int expiresInMinutes = 60)
        {
            userId ??= _testUserId;
            var user = await DbContext.Users.FindAsync(userId);
            if (user != null)
            {
                user.FitbitAccessToken = "test_access_token";
                user.FitbitRefreshToken = "test_refresh_token";
                user.FitbitUserId = "test_fitbit_user";
                user.FitbitTokenExpiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes);
                await DbContext.SaveChangesAsync();
            }
        }
    }
}
