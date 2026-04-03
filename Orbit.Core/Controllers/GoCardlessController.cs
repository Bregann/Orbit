using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.Banking;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class GoCardlessController(IGoCardlessService goCardlessService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<GoCardlessConnectionStatusDto>> GetConnectionStatus()
        {
            var status = await goCardlessService.GetConnectionStatus();
            return Ok(status);
        }

        [HttpGet]
        public async Task<ActionResult<List<GoCardlessInstitution>>> GetInstitutions([FromQuery] string country = "GB")
        {
            var institutions = await goCardlessService.GetInstitutions(country);
            return Ok(institutions ?? []);
        }

        [HttpPost]
        public async Task<ActionResult<GoCardlessInitiateConnectionResponse>> InitiateConnection([FromBody] GoCardlessInitiateConnectionRequest request)
        {
            var result = await goCardlessService.InitiateConnection(request.InstitutionId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> CompleteConnection([FromBody] GoCardlessCompleteConnectionRequest request)
        {
            await goCardlessService.CompleteConnection(request.RequisitionId);
            return Ok();
        }

        [HttpPost]
        public async Task<ActionResult> Disconnect([FromQuery] int connectionId)
        {
            await goCardlessService.DisconnectBank(connectionId);
            return Ok();
        }
    }
}
