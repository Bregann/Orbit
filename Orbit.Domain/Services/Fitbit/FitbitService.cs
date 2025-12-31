using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Interfaces.Api.Fitbit;
using Orbit.Domain.Interfaces.Helpers;
using Serilog;

namespace Orbit.Domain.Services.Fitbit
{
    public class FitbitService(AppDbContext context, IFitbitApiHelper fitbitApiHelper) : IFitbitService
    {
        public (string authUrl, string codeVerifier) GenerateAuthorizationUrl()
        {
            return fitbitApiHelper.GenerateAuthorizationUrl();
        }

        public async Task<FitbitTokenResponse> ExchangeCodeForTokensAsync(string code, string codeVerifier)
        {
            return await fitbitApiHelper.ExchangeCodeForTokensAsync(code, codeVerifier);
        }

        public async Task SaveFitbitTokensAsync(string userId, FitbitTokenResponse tokens)
        {
            Log.Information($"Saving Fitbit tokens for user {userId}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                Log.Error($"User not found: {userId}");
                throw new KeyNotFoundException("User not found");
            }

            user.FitbitAccessToken = tokens.AccessToken;
            user.FitbitRefreshToken = tokens.RefreshToken;
            user.FitbitUserId = tokens.UserId;
            user.FitbitTokenExpiresAt = DateTime.UtcNow.AddSeconds(tokens.ExpiresIn);

            await context.SaveChangesAsync();

            Log.Information($"Saved Fitbit tokens for user {userId}");
        }

        public async Task<FitbitConnectionStatus> GetConnectionStatusAsync(string userId)
        {
            Log.Information($"Getting Fitbit connection status for user {userId}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return new FitbitConnectionStatus
            {
                IsConnected = !string.IsNullOrEmpty(user.FitbitAccessToken),
                FitbitUserId = user.FitbitUserId,
                TokenExpiresAt = user.FitbitTokenExpiresAt
            };
        }

        public async Task DisconnectFitbitAsync(string userId)
        {
            Log.Information($"Disconnecting Fitbit for user {userId}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

            if (!string.IsNullOrEmpty(user.FitbitAccessToken))
            {
                try
                {
                    await fitbitApiHelper.RevokeTokenAsync(user.FitbitAccessToken);
                }
                catch (Exception ex)
                {
                    Log.Warning(ex, "Failed to revoke Fitbit token on Fitbit's side");
                }
            }

            user.FitbitAccessToken = string.Empty;
            user.FitbitRefreshToken = string.Empty;
            user.FitbitUserId = string.Empty;
            user.FitbitTokenExpiresAt = null;

            await context.SaveChangesAsync();

            Log.Information($"Disconnected Fitbit for user {userId}");
        }

        public async Task<FitbitTokenResponse> RefreshAccessTokenAsync(string userId)
        {
            Log.Information($"Refreshing Fitbit access token for user {userId}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

            if (string.IsNullOrEmpty(user.FitbitRefreshToken))
            {
                throw new InvalidOperationException("No Fitbit refresh token available");
            }

            var tokens = await fitbitApiHelper.RefreshAccessTokenAsync(user.FitbitRefreshToken);

            await SaveFitbitTokensAsync(userId, tokens);

            Log.Information($"Successfully refreshed Fitbit access token for user {userId}");

            return tokens;
        }

        public async Task<FitbitProfileResponse?> GetProfileAsync(string userId)
        {
            Log.Information($"Getting Fitbit profile for user {userId}");

            var accessToken = await GetValidAccessTokenAsync(userId);

            return await fitbitApiHelper.GetProfileAsync(accessToken);
        }

        public async Task<FitbitActivityResponse?> GetDailyActivityAsync(string userId, DateTime date)
        {
            Log.Information($"Getting Fitbit daily activity for user {userId} on {date}");

            var accessToken = await GetValidAccessTokenAsync(userId);

            return await fitbitApiHelper.GetDailyActivityAsync(accessToken, date);
        }

        private async Task<string> GetValidAccessTokenAsync(string userId)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

            if (string.IsNullOrEmpty(user.FitbitAccessToken))
            {
                throw new InvalidOperationException("Fitbit is not connected");
            }

            // Check if token is expired or about to expire (within 5 minutes)
            if (user.FitbitTokenExpiresAt.HasValue && user.FitbitTokenExpiresAt.Value <= DateTime.UtcNow.AddMinutes(5))
            {
                var newTokens = await RefreshAccessTokenAsync(userId);
                return newTokens.AccessToken;
            }

            return user.FitbitAccessToken;
        }
    }
}
