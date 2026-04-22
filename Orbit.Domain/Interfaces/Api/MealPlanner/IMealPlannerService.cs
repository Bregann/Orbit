using Orbit.Domain.DTOs.MealPlanner;

namespace Orbit.Domain.Interfaces.Api.MealPlanner
{
    public interface IMealPlannerService
    {
        Task<GetRecipesResponse> GetRecipes();
        Task<RecipeItem> GetRecipe(int recipeId);
        Task<int> AddRecipe(AddRecipeRequest request);
        Task UpdateRecipe(UpdateRecipeRequest request);
        Task DeleteRecipe(int recipeId);
        Task<GetMealPlanResponse> GetMealPlan(DateTime startDate, DateTime endDate);
        Task<int> AddMealPlanEntry(AddMealPlanEntryRequest request);
        Task DeleteMealPlanEntry(int entryId);
        Task<int> LogCook(int recipeId);
        Task<GetCookHistoryResponse> GetCookHistory(int recipeId);
        Task AddRecipeIngredientsToShoppingList(int recipeId);
    }
}
