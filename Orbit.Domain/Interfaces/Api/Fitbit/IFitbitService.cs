using Orbit.Domain.DTOs.Fitbit;

namespace Orbit.Domain.Interfaces.Api.Fitbit
{
    public interface IFitbitService
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
        /// Saves the Fitbit tokens to the user's profile
        /// </summary>
        Task SaveFitbitTokensAsync(string userId, FitbitTokenResponse tokens);

        /// <summary>
        /// Gets the connection status for the current user
        /// </summary>
        Task<FitbitConnectionStatus> GetConnectionStatusAsync(string userId);

        /// <summary>
        /// Disconnects Fitbit from the user's account
        /// </summary>
        Task DisconnectFitbitAsync(string userId);

        /// <summary>
        /// Refreshes the Fitbit access token using the refresh token
        /// </summary>
        Task<FitbitTokenResponse> RefreshAccessTokenAsync(string userId);

        /// <summary>
        /// Gets the user's Fitbit profile
        /// </summary>
        Task<FitbitProfileResponse?> GetProfileAsync(string userId);

        /// <summary>
        /// Gets the user's activity summary for a specific date
        /// </summary>
        Task<FitbitActivityResponse?> GetDailyActivityAsync(string userId, DateTime date);
    }
}
