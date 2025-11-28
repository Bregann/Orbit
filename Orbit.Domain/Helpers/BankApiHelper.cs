using Newtonsoft.Json;
using Orbit.Domain.DTOs.Banking;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces.Helpers;
using RestSharp;
using RestSharp.Authenticators.OAuth2;
using Serilog;

namespace Orbit.Domain.Helpers
{
    public class BankApiHelper(IEnvironmentalSettingHelper envSettingHelper) : IBankApiHelper
    {
        public async Task RefreshMonzoToken()
        {
            //Create the request
            var monzoClientId = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoClientId);
            var monzoClientSecret = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoClientSecret);
            var monzoRefreshToken = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoRefreshToken);

            var client = new RestClient("https://api.monzo.com/");
            var request = new RestRequest($"/oauth2/token", Method.Post);
            request.AddParameter("grant_type", "refresh_token");
            request.AddParameter("client_id", monzoClientId);
            request.AddParameter("client_secret", monzoClientSecret);
            request.AddParameter("refresh_token", monzoRefreshToken);

            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "" || !response.IsSuccessStatusCode)
            {
                Log.Warning($"[Monzo Refresh] Refresh Error - response {response.StatusCode}");
                return;
            }

            var refreshResult = JsonConvert.DeserializeObject<MonzoRefreshResponse>(response.Content);

            if (refreshResult == null)
            {
                Log.Warning("[Monzo Refresh] Refresh Error - response content was null");
                return;
            }

            await envSettingHelper.UpdateEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoClientId, refreshResult.ClientId);
            await envSettingHelper.UpdateEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoRefreshToken, refreshResult.RefreshToken);
            await envSettingHelper.UpdateEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoAccessToken, refreshResult.AccessToken);

            Log.Information("[Monzo Refresh Job] Monzo Refreshed");
        }

        public async Task<List<Transaction>?> GetMonzoTransactions()
        {
            var monzoAccessToken = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoAccessToken);
            var monzoAccountId = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.MonzoAccountId);

            //Create the request
            var clientOptions = new RestClientOptions("https://api.monzo.com/")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(monzoAccessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest($"/transactions?expand[]=merchant&account_id={monzoAccountId}&since={DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-ddTh:mm:ssZ")}", Method.Get);

            //Get the response and Deserialize
            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "")
            {
                Log.Warning("[Monzo Transactions Update] No response found");
                return null;
            }

            var transactionsResult = JsonConvert.DeserializeObject<MonzoDataResponse>(response.Content);

            if (transactionsResult!.Transactions == null)
            {
                Log.Information("[Monzo Transactions Update] No transactions found");
                return null;
            }

            return transactionsResult.Transactions;
        }

        public async Task<string?> GetGoCardlessBankingDataAccessToken()
        {
            //Create the request
            var secretId = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.BankAccountDataSecretId);
            var secretKey = envSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.BankAccountDataSecretKey);

            var client = new RestClient("https://bankaccountdata.gocardless.com");
            var request = new RestRequest("api/v2/token/new/", Method.Post);
            request.AddHeader("accept", "application/json");
            request.AddHeader("Content-Type", "application/json");
            request.AddJsonBody(new
            {
                secret_id = secretId,
                secret_key = secretKey
            });

            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "" || !response.IsSuccessStatusCode)
            {
                Log.Warning($"[GoCardless Data API] Getting access token error - response {response.StatusCode}");
                return null;
            }

            var accessTokenResult = JsonConvert.DeserializeObject<GoCardlessAccessTokenResponse>(response.Content);

            if (accessTokenResult == null)
            {
                Log.Warning("[GoCardless Data API] Getting access token error - response content was null");
                return null;
            }

            return accessTokenResult.AccessToken;
        }

        public async Task<GoCardlessTransactionsResponse?> GetGoCardlessBankingDataTransactions(string accessToken, string accountId)
        {
            //Create the request
            var clientOptions = new RestClientOptions("https://bankaccountdata.gocardless.com")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(accessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest($"api/v2/accounts/{accountId}/transactions/?date_from={DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-dd")}&date_to={DateTime.UtcNow.ToString("yyyy-MM-dd")}", Method.Get);

            //Get the response and Deserialize
            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "")
            {
                Log.Warning("[GoCardless Transactions Update] No response found");
                return null;
            }

            var transactionsResult = JsonConvert.DeserializeObject<GoCardlessTransactionsResponse>(response.Content);

            if (transactionsResult == null)
            {
                Log.Warning("[GoCardless Transactions Update] No transactions found or response content was null");
                return null;
            }

            return transactionsResult;
        }
    }
}
