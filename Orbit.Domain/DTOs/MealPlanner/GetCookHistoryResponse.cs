namespace Orbit.Domain.DTOs.MealPlanner
{
    public class GetCookHistoryResponse
    {
        public required CookHistoryItem[] History { get; set; }
    }

    public class CookHistoryItem
    {
        public required int Id { get; set; }
        public required DateTime CookedAt { get; set; }
        public required int RecipeId { get; set; }
        public required string RecipeName { get; set; }
    }
}
