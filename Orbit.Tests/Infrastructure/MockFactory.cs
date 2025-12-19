using Microsoft.AspNetCore.Http;
using Moq;
using Moq.Protected;
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

            // Add default setups as needed

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
