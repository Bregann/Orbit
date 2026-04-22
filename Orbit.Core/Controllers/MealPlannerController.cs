using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.MealPlanner;
using Orbit.Domain.Interfaces.Api.MealPlanner;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class MealPlannerController(IMealPlannerService mealPlannerService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetRecipesResponse> GetRecipes()
        {
            return await mealPlannerService.GetRecipes();
        }

        [HttpGet]
        public async Task<RecipeItem> GetRecipe([FromQuery] int recipeId)
        {
            return await mealPlannerService.GetRecipe(recipeId);
        }

        [HttpPost]
        public async Task<IActionResult> AddRecipe([FromBody] AddRecipeRequest request)
        {
            var newRecipeId = await mealPlannerService.AddRecipe(request);
            return Ok(newRecipeId);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateRecipe([FromBody] UpdateRecipeRequest request)
        {
            await mealPlannerService.UpdateRecipe(request);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteRecipe([FromQuery] int recipeId)
        {
            await mealPlannerService.DeleteRecipe(recipeId);
            return Ok();
        }

        [HttpGet]
        public async Task<GetMealPlanResponse> GetMealPlan([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
        {
            var utcStart = new DateTime(startDate, TimeOnly.MinValue, DateTimeKind.Utc);
            var utcEnd = new DateTime(endDate, TimeOnly.MinValue, DateTimeKind.Utc);
            return await mealPlannerService.GetMealPlan(utcStart, utcEnd);
        }

        [HttpPost]
        public async Task<IActionResult> AddMealPlanEntry([FromBody] AddMealPlanEntryRequest request)
        {
            var newEntryId = await mealPlannerService.AddMealPlanEntry(request);
            return Ok(newEntryId);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteMealPlanEntry([FromQuery] int entryId)
        {
            await mealPlannerService.DeleteMealPlanEntry(entryId);
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> LogCook([FromQuery] int recipeId)
        {
            var entryId = await mealPlannerService.LogCook(recipeId);
            return Ok(entryId);
        }

        [HttpGet]
        public async Task<GetCookHistoryResponse> GetCookHistory([FromQuery] int recipeId)
        {
            return await mealPlannerService.GetCookHistory(recipeId);
        }

        [HttpPost]
        public async Task<IActionResult> AddRecipeIngredientsToShoppingList([FromQuery] int recipeId)
        {
            await mealPlannerService.AddRecipeIngredientsToShoppingList(recipeId);
            return Ok();
        }
    }
}
