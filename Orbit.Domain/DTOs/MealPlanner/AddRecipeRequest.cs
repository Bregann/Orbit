namespace Orbit.Domain.DTOs.MealPlanner
{
    public class AddRecipeRequest
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public RecipeIngredientDto[]? Ingredients { get; set; }
        public RecipeStepDto[]? Steps { get; set; }
        public int? PrepTimeMinutes { get; set; }
        public int? CookTimeMinutes { get; set; }
        public int? Servings { get; set; }
    }
}
