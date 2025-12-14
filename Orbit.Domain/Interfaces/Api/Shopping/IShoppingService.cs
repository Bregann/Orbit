using Orbit.Domain.DTOs.Shopping;

namespace Orbit.Domain.Interfaces.Api.Shopping
{
    public interface IShoppingService
    {
        Task AddShoppingListItem(string name);
        Task AddShoppingListQuickAddItem(string name);
        Task ClearAllShoppingListItems();
        Task ClearPurchasedShoppingListItems();
        Task<GetShoppingListItemsDto> GetShoppingListItems();
        Task<GetShoppingListQuickAddItemsDto> GetShoppingListQuickAddItems();
        Task MarkShoppingListItemAsPurchased(int itemId);
        Task RemoveShoppingListItem(int itemId);
        Task RemoveShoppingListQuickAddItem(int itemId);
    }
}
