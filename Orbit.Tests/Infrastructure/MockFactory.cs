using Microsoft.AspNetCore.Http;
using Moq;
using Moq.Protected;
using Orbit.Domain.DTOs.Finance.Banking;
using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Helpers;
using Orbit.Domain.Interfaces.Helpers;
using System.Security.Claims;

namespace Orbit.Tests.Infrastructure
{
    /// <summary>
    /// Factory class to create common mocks used across tests
    /// </summary>
    public static class MockFactory
    {
        /// <summary>
        /// Creates a mock IHttpContextAccessor with a user identity
        /// </summary>
        public static Mock<IHttpContextAccessor> CreateHttpContextAccessor(string userId = "1", string username = "testuser")
        {
            var mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, username)
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            var context = new DefaultHttpContext
            {
                User = claimsPrincipal
            };

            mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);

            return mockHttpContextAccessor;
        }

        /// <summary>
        /// Creates a mock IUserContextHelper
        /// </summary>
        public static Mock<IUserContextHelper> CreateUserContextHelper(string userId = "1")
        {
            var mock = new Mock<IUserContextHelper>();
            mock.Setup(x => x.GetUserId()).Returns(userId);
            return mock;
        }

        /// <summary>
        /// Creates a mock IEnvironmentalSettingHelper
        /// </summary>
        public static Mock<IEnvironmentalSettingHelper> CreateEnvironmentalSettingHelper()
        {
            var mock = new Mock<IEnvironmentalSettingHelper>();

            // Setup common environmental settings
            mock.Setup(x => x.GetEnviromentalSettingValue(It.IsAny<Orbit.Domain.Enums.EnvironmentalSettingEnum>()))
                .Returns("test-value");

            mock.Setup(x => x.LoadEnvironmentalSettings())
                .Returns(Task.CompletedTask);

            return mock;
        }

        /// <summary>
        /// Creates a mock IBankApiHelper
        /// </summary>
        public static Mock<IBankApiHelper> CreateBankApiHelper()
        {
            var mock = new Mock<IBankApiHelper>();

            mock.Setup(x => x.GetGoCardlessBankingDataAccessToken())
                .ReturnsAsync("test_access_token");

            mock.Setup(x => x.GetGoCardlessBankingDataTransactions(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new GoCardlessTransactionsResponse
                {
                    Transactions = new Transactions
                    {
                        Booked = []
                    }
                });

            mock.Setup(x => x.GetMonzoTransactions())
                .ReturnsAsync(new List<Transaction>());

            mock.Setup(x => x.RefreshMonzoToken())
                .Returns(Task.CompletedTask);

            return mock;
        }

        /// <summary>
        /// Creates a mock IFitbitApiHelper
        /// </summary>
        public static Mock<IFitbitApiHelper> CreateFitbitApiHelper()
        {
            var mock = new Mock<IFitbitApiHelper>();

            mock.Setup(x => x.GenerateAuthorizationUrl())
                .Returns(("https://fitbit.com/auth?test=true", "test_code_verifier"));

            mock.Setup(x => x.ExchangeCodeForTokens(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new FitbitTokenResponse
                {
                    AccessToken = "test_access_token",
                    RefreshToken = "test_refresh_token",
                    UserId = "test_fitbit_user",
                    ExpiresIn = 3600,
                    TokenType = "Bearer",
                    Scope = "activity heartrate profile"
                });

            mock.Setup(x => x.RefreshAccessToken(It.IsAny<string>()))
                .ReturnsAsync(new FitbitTokenResponse
                {
                    AccessToken = "new_access_token",
                    RefreshToken = "new_refresh_token",
                    UserId = "test_fitbit_user",
                    ExpiresIn = 3600,
                    TokenType = "Bearer",
                    Scope = "activity heartrate profile"
                });

            mock.Setup(x => x.RevokeToken(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            mock.Setup(x => x.GetProfile(It.IsAny<string>()))
                .ReturnsAsync(new FitbitProfileResponse
                {
                    User = new FitbitUser
                    {
                        EncodedId = "test_id",
                        DisplayName = "Test User",
                        Avatar = "https://avatar.url",
                        AverageDailySteps = 8000,
                        MemberSince = "2020-01-01"
                    }
                });

            mock.Setup(x => x.GetDailyActivity(It.IsAny<string>(), It.IsAny<DateTime>()))
                .ReturnsAsync(new FitbitActivityResponse
                {
                    Summary = new FitbitActivitySummary
                    {
                        Steps = 10000,
                        CaloriesOut = 2500,
                        ActiveMinutes = 60,
                        Distances = new List<FitbitDistance>
                        {
                            new FitbitDistance { Activity = "total", Distance = 5.0 }
                        }
                    }
                });

            return mock;
        }

        /// <summary>
        /// Creates a mock ICommsSenderClient
        /// </summary>
        public static Mock<ICommsSenderClient> CreateCommsSenderClient()
        {
            var mock = new Mock<ICommsSenderClient>();

            mock.Setup(x => x.SendPushNotification(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            mock.Setup(x => x.SendTelegramMessage(It.IsAny<long>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            mock.Setup(x => x.RegisterPushToken(It.IsAny<string>()))
                .ReturnsAsync(true);

            return mock;
        }

        /// <summary>
        /// Creates a mock HttpClient for testing API calls
        /// </summary>
        public static HttpClient CreateMockHttpClient(string responseContent = "{}")
        {
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();

            // Setup default response
            mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Content = new StringContent(responseContent)
                });

            return new HttpClient(mockHttpMessageHandler.Object);
        }
    }
}
