using FinanceManager.Domain.DTOs.Pots.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class PotsController(IPotsService potsService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetSpendingPotDropdownOptionsDto> GetSpendingPotDropdownOptions()
        {
            return await potsService.GetSpendingPotDropdownOptions();
        }

        [HttpGet]
        public async Task<GetAllPotDataDto> GetAllPotData()
        {
            return await potsService.GetAllPotData();
        }
    }
}