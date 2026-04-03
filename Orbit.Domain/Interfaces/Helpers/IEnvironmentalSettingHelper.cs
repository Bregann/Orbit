using Orbit.Domain.Enums;

namespace Orbit.Domain.Interfaces.Helpers
{
    public interface IEnvironmentalSettingHelper
    {
        Task LoadEnvironmentalSettings();
        string GetEnvironmentalSettingValue(EnvironmentalSettingEnum key);
        Task<bool> UpdateEnvironmentalSettingValue(EnvironmentalSettingEnum key, string newValue);
    }
}
