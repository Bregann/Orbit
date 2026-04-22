namespace Orbit.Domain.DTOs.MealPlanner
{
    public class GetRecipesResponse
    {
        public required RecipeItem[] Recipes { get; set; }
    }

    public class RecipeItem
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public RecipeIngredientDto[]? Ingredients { get; set; }
        public RecipeStepDto[]? Steps { get; set; }
        public int? PrepTimeMinutes { get; set; }
        public int? CookTimeMinutes { get; set; }
        public int? Servings { get; set; }
        public required DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public required int TimesCooked { get; set; }
        public DateTime? LastCooked { get; set; }
    }
}
