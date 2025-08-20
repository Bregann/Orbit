using FinanceManager.Domain.Database.Context;
using FinanceManager.Domain.Enums;
using FinanceManager.Domain.Interfaces.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceManager.Domain.Helpers
{
    public class EnvironmentalSettingHelper(IServiceProvider serviceProvider) : IEnvironmentalSettingHelper
    {
        private Dictionary<EnvironmentalSettingEnum, string> _environmentalSettings = new();

        public async Task LoadEnvironmentalSettings()
        {
            using (var scope = serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                _environmentalSettings = await dbContext.EnvironmentalSettings.ToDictionaryAsync(
                    x => Enum.Parse<EnvironmentalSettingEnum>(x.Key),
                    x => x.Value
                );
            }
        }

        public string GetEnviromentalSettingValue(EnvironmentalSettingEnum key)
        {
            if (_environmentalSettings.TryGetValue(key, out var value))
            {
                return value;
            }

            throw new KeyNotFoundException($"Environmental setting for key '{key}' was not found.");
        }

        public async Task<bool> UpdateEnviromentalSettingValue(EnvironmentalSettingEnum key, string newValue)
        {
            if (!_environmentalSettings.ContainsKey(key))
            {
                return false;
            }

            using (var scope = serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.EnvironmentalSettings.Where(x => x.Key == key.ToString()).First().Value = newValue;
                await dbContext.SaveChangesAsync();
            }

            _environmentalSettings[key] = newValue;
            return true;
        }
    }
}