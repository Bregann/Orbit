using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces.Helpers;
using System.Net.Http.Json;
using System.Text.Json;

// Example implementation of a CommsSender client
namespace Orbit.Domain.Helpers
{
    public interface ICommsSenderClient
    {
        Task<bool> SendTelegramMessage(long chatId, string messageText);
        Task<bool> SendPushNotification(string title, string body);
        Task<bool> RegisterPushToken(string pushToken);
    }

    public class CommsSenderClient(HttpClient httpClient, IEnvironmentalSettingHelper environmentalSettingHelper) : ICommsSenderClient
    {
        private readonly string _baseAddress = "http://192.168.1.13:8080";
        private readonly string _apiKey = environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.CommsSenderApiKey)
            ?? throw new Exception("CommsSender API Key not configured");

        public async Task<bool> SendTelegramMessage(long chatId, string messageText)
        {
            var request = new
            {
                ChatId = chatId,
                MessageText = messageText
            };

            httpClient.DefaultRequestHeaders.Add("X-CommsSender-ApiKey", _apiKey);

            var response = await httpClient.PostAsJsonAsync($"{_baseAddress}/api/Message/SendTelegramMessage", request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();
            return result;
        }

        public async Task<bool> SendPushNotification(string title, string body)
        {
            var request = new
            {
                Title = title,
                Body = body
            };

            httpClient.DefaultRequestHeaders.Add("X-CommsSender-ApiKey", _apiKey);

            var response = await httpClient.PostAsJsonAsync($"{_baseAddress}/api/Message/SendPushNotification", request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();
            return result;
        }

        public async Task<bool> RegisterPushToken(string pushToken)
        {
            httpClient.DefaultRequestHeaders.Add("X-CommsSender-ApiKey", _apiKey);

            var response = await httpClient.PostAsJsonAsync($"{_baseAddress}/api/PushToken/RegisterPushToken", JsonSerializer.Serialize(pushToken));
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();
            return result;
        }
    }
}
