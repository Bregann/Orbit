using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Interfaces.Api.Fitbit;
using Orbit.Domain.Interfaces.Helpers;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Fitbit
{
    public class FitbitService(AppDbContext context, IFitbitApiHelper fitbitApiHelper) : IFitbitService
    {
        // Conversion factor from kilometers to miles (1 mile = 1.609344 km)
        private const double KM_TO_MILES = 1.0 / 1.609344;

        public (string authUrl, string codeVerifier) GenerateAuthorizationUrl()
        {
            return fitbitApiHelper.GenerateAuthorizationUrl();
        }

        public async Task<FitbitTokenResponse> ExchangeCodeForTokens(string code, string codeVerifier)
        {
            return await fitbitApiHelper.ExchangeCodeForTokens(code, codeVerifier);
        }

        public async Task SaveFitbitTokens(string userId, FitbitTokenResponse tokens)
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

        public async Task<FitbitConnectionStatus> GetConnectionStatus(string userId)
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

        public async Task DisconnectFitbit(string userId)
        {
            Log.Information($"Disconnecting Fitbit for user {userId}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

            if (!string.IsNullOrEmpty(user.FitbitAccessToken))
            {
                try
                {
                    await fitbitApiHelper.RevokeToken(user.FitbitAccessToken);
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

        public async Task<FitbitTokenResponse> RefreshAccessToken(string userId)
        {
            Log.Information($"Refreshing Fitbit access token for user {userId}");

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

            if (string.IsNullOrEmpty(user.FitbitRefreshToken))
            {
                throw new InvalidOperationException("No Fitbit refresh token available");
            }

            var tokens = await fitbitApiHelper.RefreshAccessToken(user.FitbitRefreshToken);

            await SaveFitbitTokens(userId, tokens);

            Log.Information($"Successfully refreshed Fitbit access token for user {userId}");

            return tokens;
        }

        public async Task<FitbitProfileResponse?> GetProfile(string userId)
        {
            Log.Information($"Getting Fitbit profile for user {userId}");

            var accessToken = await GetValidAccessToken(userId);

            return await fitbitApiHelper.GetProfile(accessToken);
        }

        public async Task<FitbitActivityResponse?> GetDailyActivity(string userId, DateTime date)
        {
            Log.Information($"Getting Fitbit daily activity for user {userId} on {date}");

            var accessToken = await GetValidAccessToken(userId);

            return await fitbitApiHelper.GetDailyActivity(accessToken, date);
        }

        public async Task RefreshFitbitTokens()
        {
            // there will only be 1 user so it's a bit overkill to loop but future proofing
            Log.Information("Refreshing Fitbit tokens for all users");

            var usersWithFitbit = await context.Users
                .Where(u => !string.IsNullOrEmpty(u.FitbitRefreshToken))
                .ToArrayAsync();

            foreach (var user in usersWithFitbit)
            {
                try
                {
                    await RefreshAccessToken(user.Id);
                }
                catch (Exception ex)
                {
                    Log.Error(ex, $"Failed to refresh Fitbit token for user {user.Id}");
                }
            }

            Log.Information("Finished refreshing Fitbit tokens for all users");
        }

        public async Task RecordDailyFitbitData()
        {
            // there will only be 1 user so it's a bit overkill to loop but future proofing
            Log.Information("Recording daily Fitbit data for all users");

            var usersWithFitbit = await context.Users
                .Where(u => !string.IsNullOrEmpty(u.FitbitAccessToken))
                .ToArrayAsync();

            var yesterday = DateTime.UtcNow.Date.AddDays(-1);

            foreach (var user in usersWithFitbit)
            {
                try
                {
                    var activity = await GetDailyActivity(user.Id, yesterday);
                    if (activity != null)
                    {
                        var fitbitData = new FitbitData
                        {
                            StepsWalked = activity.Summary!.Steps,
                            DistanceWalkedMiles = (activity.Summary.Distances!.FirstOrDefault(d => d.Activity == "total")?.Distance ?? 0) * KM_TO_MILES,
                            DateRecorded = yesterday
                        };

                        await context.FitbitData.AddAsync(fitbitData);
                        await context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Log.Error(ex, $"Failed to record daily Fitbit data for user {user.Id}");
                }
            }

            Log.Information("Finished recording daily Fitbit data for all users");
        }

        private async Task<string> GetValidAccessToken(string userId)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? throw new KeyNotFoundException("User not found");

            if (string.IsNullOrEmpty(user.FitbitAccessToken))
            {
                throw new InvalidOperationException("Fitbit is not connected");
            }

            // Check if token is expired or about to expire (within 5 minutes)
            if (user.FitbitTokenExpiresAt.HasValue && user.FitbitTokenExpiresAt.Value <= DateTime.UtcNow.AddMinutes(5))
            {
                var newTokens = await RefreshAccessToken(userId);
                return newTokens.AccessToken;
            }

            return user.FitbitAccessToken;
        }
    }
}
