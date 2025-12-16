using Orbit.Domain.DTOs.Finance.HistoricData;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface IHistoricDataService
    {
        Task<GetHistoricMonthDataDto> GetHistoricMonthData(int monthId);
        Task<GetHistoricMonthsDropdownValuesDto> GetHistoricMonthsDropdownValues();
        Task<GetYearlyHistoricDataDto> GetYearlyHistoricData();
    }
}
