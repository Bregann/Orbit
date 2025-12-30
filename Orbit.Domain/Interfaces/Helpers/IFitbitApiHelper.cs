using Orbit.Domain.DTOs.Fitbit;

namespace Orbit.Domain.Interfaces.Helpers
{
    public interface IFitbitApiHelper
    {
        /// <summary>
        /// Generates a PKCE code verifier and challenge, then returns the authorization URL
        /// </summary>
        (string authUrl, string codeVerifier) GenerateAuthorizationUrl();

        /// <summary>
        /// Exchanges the authorization code for access and refresh tokens
        /// </summary>
        Task<FitbitTokenResponse> ExchangeCodeForTokensAsync(string code, string codeVerifier);

        /// <summary>
        /// Refreshes the Fitbit access token using the refresh token
        /// </summary>
        Task<FitbitTokenResponse> RefreshAccessTokenAsync(string refreshToken);

        /// <summary>
        /// Revokes a Fitbit access token
        /// </summary>
        Task RevokeTokenAsync(string accessToken);

        /// <summary>
        /// Gets the user's Fitbit profile
        /// </summary>
        Task<FitbitProfileResponse?> GetProfileAsync(string accessToken);

        /// <summary>
        /// Gets the user's activity summary for a specific date
        /// </summary>
        Task<FitbitActivityResponse?> GetDailyActivityAsync(string accessToken, DateTime date);
    }
}
