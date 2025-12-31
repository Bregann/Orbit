using Orbit.Domain.DTOs.Fitbit;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces.Helpers;
using Serilog;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Orbit.Domain.Helpers
{
    public class FitbitApiHelper(IEnvironmentalSettingHelper environmentalSettingHelper, HttpClient httpClient) : IFitbitApiHelper
    {
        private static readonly string FitbitAuthUrl = "https://www.fitbit.com/oauth2/authorize";
        private static readonly string FitbitTokenUrl = "https://api.fitbit.com/oauth2/token";
        private static readonly string FitbitApiBaseUrl = "https://api.fitbit.com";

        private string ClientId => environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.FitbitClientId);
        private string ClientSecret => environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.FitbitClientSecret);
        private string RedirectUri => environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.FitbitRedirectUri);

        private const string Scopes = "activity heartrate profile sleep weight";

        public (string authUrl, string codeVerifier) GenerateAuthorizationUrl()
        {
            Log.Information("Generating Fitbit authorization URL");

            var codeVerifier = GenerateCodeVerifier();
            var codeChallenge = GenerateCodeChallenge(codeVerifier);

            var queryParams = new Dictionary<string, string>
            {
                { "client_id", ClientId },
                { "response_type", "code" },
                { "code_challenge", codeChallenge },
                { "code_challenge_method", "S256" },
                { "scope", Scopes },
                { "redirect_uri", RedirectUri }
            };

            var queryString = string.Join("&", queryParams.Select(kvp => 
                $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));

            var authUrl = $"{FitbitAuthUrl}?{queryString}";

            Log.Information("Generated Fitbit authorization URL successfully");

            return (authUrl, codeVerifier);
        }

        public async Task<FitbitTokenResponse> ExchangeCodeForTokensAsync(string code, string codeVerifier)
        {
            Log.Information("Exchanging authorization code for Fitbit tokens");

            var requestBody = new Dictionary<string, string>
            {
                { "client_id", ClientId },
                { "code", code },
                { "code_verifier", codeVerifier },
                { "grant_type", "authorization_code" },
                { "redirect_uri", RedirectUri }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, FitbitTokenUrl)
            {
                Content = new FormUrlEncodedContent(requestBody)
            };

            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{ClientId}:{ClientSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);

            var response = await httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"Failed to exchange code for tokens: {response.StatusCode} - {content}");
                throw new HttpRequestException($"Failed to exchange code for tokens: {response.StatusCode}");
            }

            var tokens = JsonSerializer.Deserialize<FitbitTokenResponse>(content) ?? throw new InvalidOperationException("Failed to deserialize Fitbit token response");

            Log.Information("Successfully exchanged code for Fitbit tokens");

            return tokens;
        }

        public async Task<FitbitTokenResponse> RefreshAccessTokenAsync(string refreshToken)
        {
            Log.Information("Refreshing Fitbit access token");

            var requestBody = new Dictionary<string, string>
            {
                { "grant_type", "refresh_token" },
                { "refresh_token", refreshToken }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, FitbitTokenUrl)
            {
                Content = new FormUrlEncodedContent(requestBody)
            };

            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{ClientId}:{ClientSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);

            var response = await httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"Failed to refresh Fitbit token: {response.StatusCode} - {content}");
                throw new HttpRequestException($"Failed to refresh Fitbit token: {response.StatusCode}");
            }

            var tokens = JsonSerializer.Deserialize<FitbitTokenResponse>(content) ?? throw new InvalidOperationException("Failed to deserialize Fitbit token response");

            Log.Information("Successfully refreshed Fitbit access token");

            return tokens;
        }

        public async Task RevokeTokenAsync(string accessToken)
        {
            Log.Information("Revoking Fitbit access token");

            var request = new HttpRequestMessage(HttpMethod.Post, $"{FitbitApiBaseUrl}/oauth2/revoke")
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "token", accessToken }
                })
            };

            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{ClientId}:{ClientSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);

            await httpClient.SendAsync(request);
        }

        public async Task<FitbitProfileResponse?> GetProfileAsync(string accessToken)
        {
            Log.Information("Getting Fitbit profile");

            var request = new HttpRequestMessage(HttpMethod.Get, $"{FitbitApiBaseUrl}/1/user/-/profile.json");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"Failed to get Fitbit profile: {response.StatusCode} - {content}");
                return null;
            }

            return JsonSerializer.Deserialize<FitbitProfileResponse>(content);
        }

        public async Task<FitbitActivityResponse?> GetDailyActivityAsync(string accessToken, DateTime date)
        {
            Log.Information($"Getting Fitbit daily activity for {date}");

            var dateString = date.ToString("yyyy-MM-dd");

            var request = new HttpRequestMessage(HttpMethod.Get, 
                $"{FitbitApiBaseUrl}/1/user/-/activities/date/{dateString}.json");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Log.Error($"Failed to get Fitbit daily activity: {response.StatusCode} - {content}");
                return null;
            }

            return JsonSerializer.Deserialize<FitbitActivityResponse>(content);
        }

        private static string GenerateCodeVerifier()
        {
            var bytes = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }

            return Base64UrlEncode(bytes);
        }

        private static string GenerateCodeChallenge(string codeVerifier)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.ASCII.GetBytes(codeVerifier);
            var hash = sha256.ComputeHash(bytes);
            return Base64UrlEncode(hash);
        }

        private static string Base64UrlEncode(byte[] bytes)
        {
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }
    }
}
