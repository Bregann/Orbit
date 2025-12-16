using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.HistoricData;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class HistoricMonthController(IHistoricDataService historicDataService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetHistoricMonthsDropdownValuesDto> GetHistoricMonthsDropdownValues()
        {
            return await historicDataService.GetHistoricMonthsDropdownValues();
        }

        [HttpGet]
        public async Task<ActionResult<GetHistoricMonthDataDto>> GetHistoricMonthData([FromQuery] int monthId)
        {
            try
            {
                return await historicDataService.GetHistoricMonthData(monthId);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        public async Task<GetYearlyHistoricDataDto> GetYearlyHistoricData()
        {
            return await historicDataService.GetYearlyHistoricData();
        }
    }
}
