namespace Orbit.Domain.DTOs.Shopping
{
    public class GetShoppingListQuickAddItemsDto
    {
        public required ShoppingListQuickAddItemEntry[] Items { get; set; }
    }

    public class ShoppingListQuickAddItemEntry
    {
        public int Id { get; set; }
        public required string Name { get; set; }
    }
}
