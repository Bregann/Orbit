namespace Orbit.Domain.DTOs.MealPlanner
{
    public class GetMealPlanResponse
    {
        public required MealPlanItem[] Entries { get; set; }
    }

    public class MealPlanItem
    {
        public required int Id { get; set; }
        public required DateTime Date { get; set; }
        public required string MealType { get; set; }
        public required int RecipeId { get; set; }
        public required string RecipeName { get; set; }
    }
}
