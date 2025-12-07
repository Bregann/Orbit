using Orbit.Domain.DTOs.Finance.Pots.Request;
using Orbit.Domain.DTOs.Finance.Pots.Responses;

namespace Orbit.Domain.Interfaces.Api.Finance
{
    public interface IPotsService
    {
        Task<int> AddNewPot(AddNewPotRequest request);
        Task<GetAddMonthPotDataDto> GetAddMonthPotData();
        Task<GetAllPotDataDto> GetAllPotData();
        Task<GetManagePotDataDto> GetManagePotData();
        Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions();
    }
}
