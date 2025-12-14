using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Shopping;
using Orbit.Domain.Interfaces.Api.Shopping;
using Serilog;

namespace Orbit.Domain.Services.Shopping
{
    public class ShoppingService(AppDbContext context) : IShoppingService
    {
        public async Task<GetShoppingListItemsDto> GetShoppingListItems()
        {
            var shoppingItems = await context.ShoppingListItems
                .Select(item => new ShoppingListItemEntry
                {
                    Id = item.Id,
                    Name = item.Name,
                    AddedAt = item.AddedAt,
                    IsPurchased = item.IsPurchased
                })
                .ToArrayAsync();

            return new GetShoppingListItemsDto
            {
                Items = shoppingItems
            };
        }

        public async Task<GetShoppingListQuickAddItemsDto> GetShoppingListQuickAddItems()
        {
            var quickAddItems = await context.ShoppingListQuickAddItems
                .Select(item => new ShoppingListQuickAddItemEntry
                {
                    Id = item.Id,
                    Name = item.Name,
                })
                .ToArrayAsync();

            return new GetShoppingListQuickAddItemsDto
            {
                Items = quickAddItems
            };
        }

        public async Task AddShoppingListItem(string name)
        {
            var newItem = new Database.Models.ShoppingListItem
            {
                Name = name,
                AddedAt = DateTime.UtcNow,
                IsPurchased = false
            };

            context.ShoppingListItems.Add(newItem);
            await context.SaveChangesAsync();

            Log.Information($"Added new shopping list item: {name}");
        }

        public async Task MarkShoppingListItemAsPurchased(int itemId)
        {
            var rowsAffected = await context.ShoppingListItems
                .Where(item => item.Id == itemId)
                .ExecuteUpdateAsync(update => update
                    .SetProperty(item => item.IsPurchased, true)
                );

            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Shopping list item with ID {itemId} not found.");
            }

            Log.Information($"Marked shopping list item with ID {itemId} as purchased.");
        }

        public async Task RemoveShoppingListItem(int itemId)
        {
            var rowsAffected = await context.ShoppingListItems
                .Where(item => item.Id == itemId)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Shopping list item with ID {itemId} not found.");
            }

            Log.Information($"Removed shopping list item with ID {itemId}.");
        }

        public async Task AddShoppingListQuickAddItem(string name)
        {
            var newItem = new Database.Models.ShoppingListQuickAddItem
            {
                Name = name,
            };

            context.ShoppingListQuickAddItems.Add(newItem);
            await context.SaveChangesAsync();

            Log.Information($"Added new shopping list quick add item: {name}");
        }

        public async Task RemoveShoppingListQuickAddItem(int itemId)
        {
            var rowsAffected = await context.ShoppingListQuickAddItems
                .Where(item => item.Id == itemId)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Shopping list quick add item with ID {itemId} not found.");
            }

            Log.Information($"Removed shopping list quick add item with ID {itemId}.");
        }

        public async Task ClearPurchasedShoppingListItems()
        {
            var rowsAffected = await context.ShoppingListItems
                .Where(item => item.IsPurchased)
                .ExecuteDeleteAsync();

            Log.Information($"Cleared {rowsAffected} purchased shopping list items.");
        }

        public async Task ClearAllShoppingListItems()
        {
            var rowsAffected = await context.ShoppingListItems
                .ExecuteDeleteAsync();

            Log.Information($"Cleared all ({rowsAffected}) shopping list items.");
        }
    }
}
