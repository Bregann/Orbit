using Newtonsoft.Json;
using Orbit.Domain.DTOs.Finance.Banking;
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
            var monzoClientId = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoClientId);
            var monzoClientSecret = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoClientSecret);
            var monzoRefreshToken = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoRefreshToken);

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

            await envSettingHelper.UpdateEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoClientId, refreshResult.ClientId);
            await envSettingHelper.UpdateEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoRefreshToken, refreshResult.RefreshToken);
            await envSettingHelper.UpdateEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoAccessToken, refreshResult.AccessToken);

            Log.Information("[Monzo Refresh Job] Monzo Refreshed");
        }

        public async Task<List<Transaction>?> GetMonzoTransactions()
        {
            var monzoAccessToken = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoAccessToken);
            var monzoAccountId = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.MonzoAccountId);

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
            var secretId = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.BankAccountDataSecretId);
            var secretKey = envSettingHelper.GetEnvironmentalSettingValue(EnvironmentalSettingEnum.BankAccountDataSecretKey);

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

        public async Task<List<GoCardlessInstitution>?> GetGoCardlessInstitutions(string accessToken, string country)
        {
            var clientOptions = new RestClientOptions("https://bankaccountdata.gocardless.com")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(accessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest($"api/v2/institutions/?country={country}", Method.Get);

            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "" || !response.IsSuccessStatusCode)
            {
                Log.Warning($"[GoCardless] Failed to get institutions - response {response.StatusCode}");
                return null;
            }

            return JsonConvert.DeserializeObject<List<GoCardlessInstitution>>(response.Content);
        }

        public async Task<GoCardlessAgreementResponse?> CreateEndUserAgreement(string accessToken, string institutionId, int accessValidForDays = 90)
        {
            var clientOptions = new RestClientOptions("https://bankaccountdata.gocardless.com")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(accessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest("api/v2/agreements/enduser/", Method.Post);
            request.AddHeader("Content-Type", "application/json");
            request.AddJsonBody(new
            {
                institution_id = institutionId,
                max_historical_days = 90,
                access_valid_for_days = accessValidForDays,
                access_scope = new[] { "balances", "details", "transactions" }
            });

            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "" || !response.IsSuccessStatusCode)
            {
                Log.Warning($"[GoCardless] Failed to create end user agreement - response {response.StatusCode} - {response.Content}");
                return null;
            }

            return JsonConvert.DeserializeObject<GoCardlessAgreementResponse>(response.Content);
        }

        public async Task<GoCardlessRequisitionResponse?> CreateRequisition(string accessToken, string agreementId, string institutionId, string redirectUrl)
        {
            var clientOptions = new RestClientOptions("https://bankaccountdata.gocardless.com")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(accessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest("api/v2/requisitions/", Method.Post);
            request.AddHeader("Content-Type", "application/json");
            request.AddJsonBody(new
            {
                redirect = redirectUrl,
                institution_id = institutionId,
                agreement = agreementId
            });

            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "" || !response.IsSuccessStatusCode)
            {
                Log.Warning($"[GoCardless] Failed to create requisition - response {response.StatusCode} - {response.Content}");
                return null;
            }

            return JsonConvert.DeserializeObject<GoCardlessRequisitionResponse>(response.Content);
        }

        public async Task<GoCardlessRequisitionResponse?> GetRequisition(string accessToken, string requisitionId)
        {
            var clientOptions = new RestClientOptions("https://bankaccountdata.gocardless.com")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(accessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest($"api/v2/requisitions/{requisitionId}/", Method.Get);

            var response = await client.ExecuteAsync(request);

            if (response.Content == null || response.Content == "" || !response.IsSuccessStatusCode)
            {
                Log.Warning($"[GoCardless] Failed to get requisition - response {response.StatusCode}");
                return null;
            }

            return JsonConvert.DeserializeObject<GoCardlessRequisitionResponse>(response.Content);
        }

        public async Task<bool> DeleteRequisition(string accessToken, string requisitionId)
        {
            var clientOptions = new RestClientOptions("https://bankaccountdata.gocardless.com")
            {
                Authenticator = new OAuth2AuthorizationRequestHeaderAuthenticator(accessToken, "Bearer")
            };

            var client = new RestClient(clientOptions);
            var request = new RestRequest($"api/v2/requisitions/{requisitionId}/", Method.Delete);

            var response = await client.ExecuteAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                Log.Warning($"[GoCardless] Failed to delete requisition - response {response.StatusCode}");
                return false;
            }

            return true;
        }
    }
}
