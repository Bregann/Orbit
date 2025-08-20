using FinanceManager.Domain.DTOs.Pots.Request;
using FinanceManager.Domain.DTOs.Pots.Responses;

namespace FinanceManager.Domain.Interfaces.Api
{
    public interface IPotsService
    {
        Task<int> AddNewPot(AddNewPotRequest request);
        Task<GetAllPotDataDto> GetAllPotData();
        Task<GetManagePotDataDto> GetManagePotData();
        Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions();
    }
}
