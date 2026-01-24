using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Finance.Transactions.Requests;
using Orbit.Domain.DTOs.Finance.Transactions.Responses;
using Orbit.Domain.Interfaces.Api.Finance;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class TransactionsController(ITransactionsService transactionsService) : ControllerBase
    {
        [HttpPatch]
        public async Task<IActionResult> UpdateTransaction([FromBody] UpdateTransactionRequest request)
        {
            try
            {
                await transactionsService.UpdateTransaction(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        public async Task<GetUnprocessedTransactionsDto> GetUnprocessedTransactions()
        {
            return await transactionsService.GetUnprocessedTransactions();
        }

        [HttpGet]
        public async Task<GetTransactionsForCurrentMonthDto> GetTransactionsForMonth()
        {
            return await transactionsService.GetTransactionsForMonth();
        }

        [HttpGet]
        public async Task<GetAutomaticTransactionsDto> GetAutomaticTransactions()
        {
            return await transactionsService.GetAutomaticTransactions();
        }

        [HttpPost]
        public async Task<IActionResult> AddAutomaticTransaction([FromBody] AddAutomaticTransactionRequest request)
        {
            try
            {
                var newId = await transactionsService.AddAutomaticTransaction(request);
                return Ok(newId);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch]
        public async Task<IActionResult> MarkAsSubscription([FromQuery] string transactionId)
        {
            try
            {
                await transactionsService.MarkAsSubscription(transactionId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPatch]
        public async Task<IActionResult> SplitTransaction([FromBody] SplitTransactionRequest request)
        {
            try
            {
                await transactionsService.SplitTransaction(request);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
