namespace Orbit.Domain.DTOs.MealPlanner
{
    public class RecipeIngredientDto
    {
        public required string Name { get; set; }
        public string? Quantity { get; set; }
    }
}
