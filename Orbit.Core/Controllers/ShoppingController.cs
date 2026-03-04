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
            await shoppingService.MarkShoppingListItemAsPurchased(itemId);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveShoppingListItem([FromQuery] int itemId)
        {
            await shoppingService.RemoveShoppingListItem(itemId);
            return Ok();
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
            await shoppingService.RemoveShoppingListQuickAddItem(itemId);
            return Ok();
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
