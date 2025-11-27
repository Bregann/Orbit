using Orbit.Domain.DTOs.Pots.Request;
using Orbit.Domain.DTOs.Pots.Responses;

namespace Orbit.Domain.Interfaces.Api
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
