using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Shopping;
using Orbit.Domain.Interfaces.Api.Shopping;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class ShoppingController(IShoppingService shoppingService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetShoppingListItemsDto> GetShoppingListItems()
        {
            return await shoppingService.GetShoppingListItems();
        }

        [HttpGet]
        public async Task<GetShoppingListQuickAddItemsDto> GetShoppingListQuickAddItems()
        {
            return await shoppingService.GetShoppingListQuickAddItems();
        }

        [HttpPost]
        public async Task<IActionResult> AddShoppingListItem([FromQuery] string name)
        {
            await shoppingService.AddShoppingListItem(name);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> MarkShoppingListItemAsPurchased([FromQuery] int itemId)
        {
            try
            {
                await shoppingService.MarkShoppingListItemAsPurchased(itemId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveShoppingListItem([FromQuery] int itemId)
        {
            try
            {
                await shoppingService.RemoveShoppingListItem(itemId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddShoppingListQuickAddItem([FromQuery] string name)
        {
            await shoppingService.AddShoppingListQuickAddItem(name);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveShoppingListQuickAddItem([FromQuery] int itemId)
        {
            try
            {
                await shoppingService.RemoveShoppingListQuickAddItem(itemId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<IActionResult> ClearPurchasedShoppingListItems()
        {
            await shoppingService.ClearPurchasedShoppingListItems();
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearAllShoppingListItems()
        {
            await shoppingService.ClearAllShoppingListItems();
            return Ok();
        }
    }
}
