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
            await transactionsService.UpdateTransaction(request);
            return Ok();
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
            var newId = await transactionsService.AddAutomaticTransaction(request);
            return Ok(newId);
        }

        [HttpPatch]
        public async Task<IActionResult> MarkAsSubscription([FromQuery] string transactionId)
        {
            await transactionsService.MarkAsSubscription(transactionId);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> SplitTransaction([FromBody] SplitTransactionRequest request)
        {
            await transactionsService.SplitTransaction(request);
            return Ok();
        }
    }
}
