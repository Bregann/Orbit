using FinanceManager.Domain.DTOs.Transactions.Requests;
using FinanceManager.Domain.DTOs.Transactions.Responses;
using FinanceManager.Domain.Interfaces.Api;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceManager.Core.Controllers
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
    }
}
