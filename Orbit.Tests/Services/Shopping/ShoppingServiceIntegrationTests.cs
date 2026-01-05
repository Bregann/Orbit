using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Services.Shopping;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Shopping
{
    [TestFixture]
    public class ShoppingServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private ShoppingService _shoppingService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestShoppingData(DbContext);

            _shoppingService = new ShoppingService(DbContext);
        }

        [Test]
        public async Task GetShoppingListItems_ShouldReturnAllItems()
        {
            // Act
            var result = await _shoppingService.GetShoppingListItems();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Items, Is.Not.Empty);
            Assert.That(result.Items.Length, Is.EqualTo(4));
        }

        [Test]
        public async Task GetShoppingListItems_ShouldReturnEmptyArray_WhenNoItems()
        {
            // Arrange
            DbContext.ShoppingListItems.RemoveRange(DbContext.ShoppingListItems);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _shoppingService.GetShoppingListItems();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Items, Is.Empty);
        }

        [Test]
        public async Task GetShoppingListItems_ShouldIncludeAllProperties()
        {
            // Act
            var result = await _shoppingService.GetShoppingListItems();

            // Assert
            var item = result.Items.First();
            Assert.That(item.Id, Is.GreaterThan(0));
            Assert.That(item.Name, Is.Not.Null.And.Not.Empty);
            Assert.That(item.AddedAt, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task GetShoppingListItems_ShouldIncludeBothPurchasedAndUnpurchased()
        {
            // Act
            var result = await _shoppingService.GetShoppingListItems();

            // Assert
            Assert.That(result.Items.Any(i => i.IsPurchased), Is.True);
            Assert.That(result.Items.Any(i => !i.IsPurchased), Is.True);
        }

        [Test]
        public async Task GetShoppingListQuickAddItems_ShouldReturnAllItems()
        {
            // Act
            var result = await _shoppingService.GetShoppingListQuickAddItems();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Items, Is.Not.Empty);
            Assert.That(result.Items.Length, Is.EqualTo(3));
        }

        [Test]
        public async Task GetShoppingListQuickAddItems_ShouldReturnEmptyArray_WhenNoItems()
        {
            // Arrange
            DbContext.ShoppingListQuickAddItems.RemoveRange(DbContext.ShoppingListQuickAddItems);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _shoppingService.GetShoppingListQuickAddItems();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Items, Is.Empty);
        }

        [Test]
        public async Task GetShoppingListQuickAddItems_ShouldIncludeAllProperties()
        {
            // Act
            var result = await _shoppingService.GetShoppingListQuickAddItems();

            // Assert
            var item = result.Items.First();
            Assert.That(item.Id, Is.GreaterThan(0));
            Assert.That(item.Name, Is.Not.Null.And.Not.Empty);
        }

        [Test]
        public async Task AddShoppingListItem_ShouldAddNewItem()
        {
            // Arrange
            var initialCount = await DbContext.ShoppingListItems.CountAsync();

            // Act
            await _shoppingService.AddShoppingListItem("Cheese");

            // Assert
            var finalCount = await DbContext.ShoppingListItems.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task AddShoppingListItem_ShouldSaveWithCorrectData()
        {
            // Act
            await _shoppingService.AddShoppingListItem("Apples");

            // Assert
            var item = await DbContext.ShoppingListItems
                .FirstOrDefaultAsync(i => i.Name == "Apples");

            Assert.That(item, Is.Not.Null);
            Assert.That(item.IsPurchased, Is.False);
        }

        [Test]
        public async Task AddShoppingListItem_ShouldSetAddedAtToUtcNow()
        {
            // Arrange
            var beforeAdding = DateTime.UtcNow.AddSeconds(-1);

            // Act
            await _shoppingService.AddShoppingListItem("Bananas");
            var afterAdding = DateTime.UtcNow.AddSeconds(1);

            // Assert
            var item = await DbContext.ShoppingListItems
                .FirstOrDefaultAsync(i => i.Name == "Bananas");

            Assert.That(item, Is.Not.Null);
            Assert.That(item.AddedAt, Is.GreaterThan(beforeAdding));
            Assert.That(item.AddedAt, Is.LessThan(afterAdding));
            Assert.That(item.AddedAt.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public async Task MarkShoppingListItemAsPurchased_ShouldUpdateItem()
        {
            // Arrange
            var item = DbContext.ShoppingListItems.First(i => !i.IsPurchased);
            var itemId = item.Id;

            // Act
            await _shoppingService.MarkShoppingListItemAsPurchased(itemId);

            // Assert
            var updated = await DbContext.ShoppingListItems.FindAsync(itemId);
            Assert.That(updated!.IsPurchased, Is.True);
        }

        [Test]
        public async Task MarkShoppingListItemAsPurchased_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _shoppingService.MarkShoppingListItemAsPurchased(99999));

            Assert.That(exception!.Message, Does.Contain("Shopping list item with ID 99999 not found"));
        }

        [Test]
        public async Task RemoveShoppingListItem_ShouldDeleteItem()
        {
            // Arrange
            var item = DbContext.ShoppingListItems.First();
            var itemId = item.Id;
            var initialCount = await DbContext.ShoppingListItems.CountAsync();

            // Act
            await _shoppingService.RemoveShoppingListItem(itemId);

            // Assert
            var deleted = await DbContext.ShoppingListItems.FindAsync(itemId);
            var finalCount = await DbContext.ShoppingListItems.CountAsync();

            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task RemoveShoppingListItem_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _shoppingService.RemoveShoppingListItem(99999));

            Assert.That(exception!.Message, Does.Contain("Shopping list item with ID 99999 not found"));
        }

        [Test]
        public async Task AddShoppingListQuickAddItem_ShouldAddNewItem()
        {
            // Arrange
            var initialCount = await DbContext.ShoppingListQuickAddItems.CountAsync();

            // Act
            await _shoppingService.AddShoppingListQuickAddItem("Yogurt");

            // Assert
            var finalCount = await DbContext.ShoppingListQuickAddItems.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task AddShoppingListQuickAddItem_ShouldSaveWithCorrectData()
        {
            // Act
            await _shoppingService.AddShoppingListQuickAddItem("Coffee");

            // Assert
            var item = await DbContext.ShoppingListQuickAddItems
                .FirstOrDefaultAsync(i => i.Name == "Coffee");

            Assert.That(item, Is.Not.Null);
            Assert.That(item.Name, Is.EqualTo("Coffee"));
        }

        [Test]
        public async Task RemoveShoppingListQuickAddItem_ShouldDeleteItem()
        {
            // Arrange
            var item = DbContext.ShoppingListQuickAddItems.First();
            var itemId = item.Id;
            var initialCount = await DbContext.ShoppingListQuickAddItems.CountAsync();

            // Act
            await _shoppingService.RemoveShoppingListQuickAddItem(itemId);

            // Assert
            var deleted = await DbContext.ShoppingListQuickAddItems.FindAsync(itemId);
            var finalCount = await DbContext.ShoppingListQuickAddItems.CountAsync();

            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task RemoveShoppingListQuickAddItem_ShouldThrowKeyNotFoundException_WhenNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _shoppingService.RemoveShoppingListQuickAddItem(99999));

            Assert.That(exception!.Message, Does.Contain("Shopping list quick add item with ID 99999 not found"));
        }

        [Test]
        public async Task ClearPurchasedShoppingListItems_ShouldRemoveOnlyPurchasedItems()
        {
            // Arrange
            var purchasedCount = await DbContext.ShoppingListItems.CountAsync(i => i.IsPurchased);
            var unpurchasedCount = await DbContext.ShoppingListItems.CountAsync(i => !i.IsPurchased);

            Assert.That(purchasedCount, Is.GreaterThan(0), "Test requires purchased items");

            // Act
            await _shoppingService.ClearPurchasedShoppingListItems();

            // Assert
            var remainingPurchased = await DbContext.ShoppingListItems.CountAsync(i => i.IsPurchased);
            var remainingUnpurchased = await DbContext.ShoppingListItems.CountAsync(i => !i.IsPurchased);

            Assert.That(remainingPurchased, Is.EqualTo(0));
            Assert.That(remainingUnpurchased, Is.EqualTo(unpurchasedCount));
        }

        [Test]
        public async Task ClearPurchasedShoppingListItems_ShouldDoNothing_WhenNoPurchasedItems()
        {
            // Arrange
            var purchasedItems = await DbContext.ShoppingListItems.Where(i => i.IsPurchased).ToListAsync();
            DbContext.ShoppingListItems.RemoveRange(purchasedItems);
            await DbContext.SaveChangesAsync();

            var initialCount = await DbContext.ShoppingListItems.CountAsync();

            // Act
            await _shoppingService.ClearPurchasedShoppingListItems();

            // Assert
            var finalCount = await DbContext.ShoppingListItems.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount));
        }

        [Test]
        public async Task ClearAllShoppingListItems_ShouldRemoveAllItems()
        {
            // Arrange
            var initialCount = await DbContext.ShoppingListItems.CountAsync();
            Assert.That(initialCount, Is.GreaterThan(0), "Test requires items");

            // Act
            await _shoppingService.ClearAllShoppingListItems();

            // Assert
            var finalCount = await DbContext.ShoppingListItems.CountAsync();
            Assert.That(finalCount, Is.EqualTo(0));
        }

        [Test]
        public async Task ClearAllShoppingListItems_ShouldNotAffectQuickAddItems()
        {
            // Arrange
            var initialQuickAddCount = await DbContext.ShoppingListQuickAddItems.CountAsync();

            // Act
            await _shoppingService.ClearAllShoppingListItems();

            // Assert
            var finalQuickAddCount = await DbContext.ShoppingListQuickAddItems.CountAsync();
            Assert.That(finalQuickAddCount, Is.EqualTo(initialQuickAddCount));
        }

        [Test]
        public async Task AddAndMarkAsPurchased_ShouldWorkTogether()
        {
            // Arrange
            await _shoppingService.AddShoppingListItem("Tomatoes");
            var item = await DbContext.ShoppingListItems
                .FirstAsync(i => i.Name == "Tomatoes");

            Assert.That(item.IsPurchased, Is.False);

            // Act
            await _shoppingService.MarkShoppingListItemAsPurchased(item.Id);

            // Assert
            var updated = await DbContext.ShoppingListItems.FindAsync(item.Id);
            Assert.That(updated!.IsPurchased, Is.True);
        }

        [Test]
        public async Task AddMarkAndClearPurchased_ShouldWorkTogether()
        {
            // Arrange
            await _shoppingService.AddShoppingListItem("Cucumber");
            var item = await DbContext.ShoppingListItems
                .FirstAsync(i => i.Name == "Cucumber");

            await _shoppingService.MarkShoppingListItemAsPurchased(item.Id);

            var beforeClear = await DbContext.ShoppingListItems.CountAsync();

            // Act
            await _shoppingService.ClearPurchasedShoppingListItems();

            // Assert
            var afterClear = await DbContext.ShoppingListItems.CountAsync();
            var deletedItem = await DbContext.ShoppingListItems.FindAsync(item.Id);

            Assert.That(deletedItem, Is.Null);
            Assert.That(afterClear, Is.LessThan(beforeClear));
        }

        [Test]
        public async Task AddShoppingListItem_ShouldHandleSpecialCharacters()
        {
            // Act
            await _shoppingService.AddShoppingListItem("Crème Fraîche ??");

            // Assert
            var item = await DbContext.ShoppingListItems
                .FirstOrDefaultAsync(i => i.Name.Contains("Crème"));

            Assert.That(item, Is.Not.Null);
            Assert.That(item.Name, Does.Contain("??"));
        }

        [Test]
        public async Task AddShoppingListItem_ShouldHandleLongNames()
        {
            // Arrange
            var longName = new string('A', 200);

            // Act
            await _shoppingService.AddShoppingListItem(longName);

            // Assert
            var item = await DbContext.ShoppingListItems
                .FirstOrDefaultAsync(i => i.Name == longName);

            Assert.That(item, Is.Not.Null);
            Assert.That(item.Name.Length, Is.EqualTo(200));
        }

        [Test]
        public async Task GetShoppingListItems_ShouldReturnItemsInCorrectOrder()
        {
            // Arrange
            DbContext.ShoppingListItems.RemoveRange(DbContext.ShoppingListItems);
            await DbContext.SaveChangesAsync();

            await _shoppingService.AddShoppingListItem("Item 1");
            await Task.Delay(10);
            await _shoppingService.AddShoppingListItem("Item 2");
            await Task.Delay(10);
            await _shoppingService.AddShoppingListItem("Item 3");

            // Act
            var result = await _shoppingService.GetShoppingListItems();

            // Assert
            Assert.That(result.Items.Length, Is.EqualTo(3));
            Assert.That(result.Items.Any(i => i.Name == "Item 1"), Is.True);
            Assert.That(result.Items.Any(i => i.Name == "Item 2"), Is.True);
            Assert.That(result.Items.Any(i => i.Name == "Item 3"), Is.True);
        }
    }
}
