using FinanceManager.Domain.Enums;

namespace FinanceManager.Domain.Interfaces.Helpers
{
    public interface IEnvironmentalSettingHelper
    {
        Task LoadEnvironmentalSettings();
        string GetEnviromentalSettingValue(EnvironmentalSettingEnum key);
        Task<bool> UpdateEnviromentalSettingValue(EnvironmentalSettingEnum key, string newValue);
    }
}