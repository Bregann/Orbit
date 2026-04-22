namespace Orbit.Domain.DTOs.MealPlanner
{
    public class AddMealPlanEntryRequest
    {
        public required DateTime Date { get; set; }
        public required string MealType { get; set; }
        public required int RecipeId { get; set; }
    }
}
