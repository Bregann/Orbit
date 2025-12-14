namespace Orbit.Domain.DTOs.Shopping
{
    public class GetShoppingListItemsDto
    {
        public required ShoppingListItemEntry[] Items { get; set; }
    }

    public class ShoppingListItemEntry
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required DateTime AddedAt { get; set; }
        public required bool IsPurchased { get; set; }
    }
}
