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
        Task<FitbitTokenResponse> ExchangeCodeForTokens(string code, string codeVerifier);

        /// <summary>
        /// Refreshes the Fitbit access token using the refresh token
        /// </summary>
        Task<FitbitTokenResponse> RefreshAccessToken(string refreshToken);

        /// <summary>
        /// Revokes a Fitbit access token
        /// </summary>
        Task RevokeToken(string accessToken);

        /// <summary>
        /// Gets the user's Fitbit profile
        /// </summary>
        Task<FitbitProfileResponse?> GetProfile(string accessToken);

        /// <summary>
        /// Gets the user's activity summary for a specific date
        /// </summary>
        Task<FitbitActivityResponse?> GetDailyActivity(string accessToken, DateTime date);
    }
}
