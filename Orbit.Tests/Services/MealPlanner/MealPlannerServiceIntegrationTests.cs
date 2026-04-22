using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.MealPlanner;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Services.MealPlanner;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.MealPlanner
{
    [TestFixture]
    public class MealPlannerServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private MealPlannerService _mealPlannerService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestMealPlannerData(DbContext);

            _mealPlannerService = new MealPlannerService(DbContext);
        }

        // ===== Recipe CRUD Tests =====

        [Test]
        public async Task GetRecipes_ShouldReturnAllRecipes()
        {
            var result = await _mealPlannerService.GetRecipes();
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Recipes, Is.Not.Empty);
            Assert.That(result.Recipes.Length, Is.EqualTo(3));
        }

        [Test]
        public async Task GetRecipes_ShouldReturnEmptyArray_WhenNoRecipes()
        {
            DbContext.RecipeCookHistory.RemoveRange(DbContext.RecipeCookHistory);
            DbContext.MealPlanEntries.RemoveRange(DbContext.MealPlanEntries);
            DbContext.Recipes.RemoveRange(DbContext.Recipes);
            await DbContext.SaveChangesAsync();

            var result = await _mealPlannerService.GetRecipes();
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Recipes, Is.Empty);
        }

        [Test]
        public async Task GetRecipes_ShouldReturnRecipesOrderedByName()
        {
            var result = await _mealPlannerService.GetRecipes();
            var names = result.Recipes.Select(r => r.Name).ToArray();
            Assert.That(names, Is.EqualTo(names.OrderBy(n => n).ToArray()));
        }

        [Test]
        public async Task GetRecipes_ShouldIncludeAllProperties()
        {
            var result = await _mealPlannerService.GetRecipes();
            var recipe = result.Recipes.First(r => r.Name == "Spaghetti Bolognese");
            Assert.That(recipe.Id, Is.GreaterThan(0));
            Assert.That(recipe.Name, Is.Not.Null.And.Not.Empty);
            Assert.That(recipe.Description, Is.Not.Null.And.Not.Empty);
            Assert.That(recipe.Ingredients, Is.Not.Null);
            Assert.That(recipe.Steps, Is.Not.Null);
            Assert.That(recipe.Ingredients!.Length, Is.GreaterThan(0));
            Assert.That(recipe.Steps!.Length, Is.GreaterThan(0));
            Assert.That(recipe.PrepTimeMinutes, Is.Not.Null);
            Assert.That(recipe.CookTimeMinutes, Is.Not.Null);
            Assert.That(recipe.Servings, Is.Not.Null);
            Assert.That(recipe.CreatedAt, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task GetRecipes_ShouldIncludeTimesCooked()
        {
            var result = await _mealPlannerService.GetRecipes();
            var bolognese = result.Recipes.First(r => r.Name == "Spaghetti Bolognese");
            Assert.That(bolognese.TimesCooked, Is.EqualTo(2));
        }

        [Test]
        public async Task GetRecipes_ShouldIncludeLastCooked()
        {
            var result = await _mealPlannerService.GetRecipes();
            var bolognese = result.Recipes.First(r => r.Name == "Spaghetti Bolognese");
            Assert.That(bolognese.LastCooked, Is.Not.Null);
        }

        [Test]
        public async Task GetRecipes_ShouldReturnZeroTimesCooked_WhenNeverCooked()
        {
            var result = await _mealPlannerService.GetRecipes();
            var omelette = result.Recipes.First(r => r.Name == "Cheese Omelette");
            Assert.That(omelette.TimesCooked, Is.EqualTo(0));
            Assert.That(omelette.LastCooked, Is.Null);
        }

        [Test]
        public async Task AddRecipe_ShouldAddNewRecipe()
        {
            var initialCount = await DbContext.Recipes.CountAsync();

            await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Pancakes",
                Description = "Fluffy breakfast pancakes",
                Ingredients = new[] {
                    new RecipeIngredientDto { Name = "Flour", Quantity = "200g" },
                    new RecipeIngredientDto { Name = "Eggs", Quantity = "2" },
                    new RecipeIngredientDto { Name = "Milk", Quantity = "300ml" },
                    new RecipeIngredientDto { Name = "Sugar", Quantity = "2 tbsp" }
                },
                Steps = new[] {
                    new RecipeStepDto { StepNumber = 1, Instruction = "Mix ingredients" },
                    new RecipeStepDto { StepNumber = 2, Instruction = "Cook on pan" }
                },
                PrepTimeMinutes = 5,
                CookTimeMinutes = 15,
                Servings = 4
            });

            var finalCount = await DbContext.Recipes.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task AddRecipe_ShouldReturnNewRecipeId()
        {
            var newId = await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Toast",
                Description = "Simple toast"
            });

            Assert.That(newId, Is.GreaterThan(0));
        }

        [Test]
        public async Task AddRecipe_ShouldSaveWithCorrectData()
        {
            await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Fish and Chips",
                Description = "British classic",
                Ingredients = new[] {
                    new RecipeIngredientDto { Name = "Fish", Quantity = "2 fillets" },
                    new RecipeIngredientDto { Name = "Potatoes", Quantity = "4" },
                    new RecipeIngredientDto { Name = "Batter", Quantity = "200g" }
                },
                PrepTimeMinutes = 20,
                CookTimeMinutes = 25,
                Servings = 2
            });

            var recipe = await DbContext.Recipes
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Name == "Fish and Chips");
            Assert.That(recipe, Is.Not.Null);
            Assert.That(recipe.Description, Is.EqualTo("British classic"));
            Assert.That(recipe.Ingredients, Has.Count.EqualTo(3));
            Assert.That(recipe.Ingredients.Any(i => i.Name == "Fish"), Is.True);
            Assert.That(recipe.PrepTimeMinutes, Is.EqualTo(20));
            Assert.That(recipe.CookTimeMinutes, Is.EqualTo(25));
            Assert.That(recipe.Servings, Is.EqualTo(2));
        }

        [Test]
        public async Task AddRecipe_ShouldSetCreatedAtToUtcNow()
        {
            var beforeAdding = DateTime.UtcNow.AddSeconds(-1);

            await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Soup",
                Description = "Warm soup"
            });

            var afterAdding = DateTime.UtcNow.AddSeconds(1);
            var recipe = await DbContext.Recipes.FirstOrDefaultAsync(r => r.Name == "Soup");
            Assert.That(recipe, Is.Not.Null);
            Assert.That(recipe.CreatedAt, Is.GreaterThan(beforeAdding));
            Assert.That(recipe.CreatedAt, Is.LessThan(afterAdding));
        }

        [Test]
        public async Task AddRecipe_ShouldHandleNullOptionalFields()
        {
            var newId = await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Mystery Dish",
                Description = "No details"
            });

            var recipe = await DbContext.Recipes
                .Include(r => r.Ingredients)
                .Include(r => r.Steps)
                .FirstAsync(r => r.Id == newId);
            Assert.That(recipe, Is.Not.Null);
            Assert.That(recipe.Ingredients, Is.Empty);
            Assert.That(recipe.Steps, Is.Empty);
            Assert.That(recipe.PrepTimeMinutes, Is.Null);
            Assert.That(recipe.CookTimeMinutes, Is.Null);
            Assert.That(recipe.Servings, Is.Null);
        }

        [Test]
        public async Task UpdateRecipe_ShouldUpdateAllFields()
        {
            var recipe = await DbContext.Recipes.FirstAsync();
            var recipeId = recipe.Id;

            await _mealPlannerService.UpdateRecipe(new UpdateRecipeRequest
            {
                Id = recipeId,
                Name = "Updated Name",
                Description = "Updated Description",
                Ingredients = new[] {
                    new RecipeIngredientDto { Name = "New Ingredient", Quantity = "1" }
                },
                Steps = new[] {
                    new RecipeStepDto { StepNumber = 1, Instruction = "Do the thing" }
                },
                PrepTimeMinutes = 99,
                CookTimeMinutes = 88,
                Servings = 10
            });

            DbContext.ChangeTracker.Clear();
            var updated = await DbContext.Recipes
                .Include(r => r.Ingredients)
                .Include(r => r.Steps)
                .FirstAsync(r => r.Id == recipeId);
            Assert.That(updated.Name, Is.EqualTo("Updated Name"));
            Assert.That(updated.Description, Is.EqualTo("Updated Description"));
            Assert.That(updated.Ingredients, Has.Count.EqualTo(1));
            Assert.That(updated.Ingredients.First().Name, Is.EqualTo("New Ingredient"));
            Assert.That(updated.Steps, Has.Count.EqualTo(1));
            Assert.That(updated.Steps.First().Instruction, Is.EqualTo("Do the thing"));
            Assert.That(updated.PrepTimeMinutes, Is.EqualTo(99));
            Assert.That(updated.CookTimeMinutes, Is.EqualTo(88));
            Assert.That(updated.Servings, Is.EqualTo(10));
            Assert.That(updated.LastUpdatedAt, Is.Not.Null);
        }

        [Test]
        public async Task UpdateRecipe_ShouldThrowNotFoundException_WhenNotFound()
        {
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _mealPlannerService.UpdateRecipe(new UpdateRecipeRequest
                {
                    Id = 99999,
                    Name = "Nonexistent",
                    Description = "Nope"
                }));

            Assert.That(exception!.Message, Does.Contain("Recipe with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteRecipe_ShouldDeleteRecipe()
        {
            // First add a recipe with no dependencies
            var newId = await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "To Delete",
                Description = "Will be deleted"
            });

            var initialCount = await DbContext.Recipes.CountAsync();
            await _mealPlannerService.DeleteRecipe(newId);
            DbContext.ChangeTracker.Clear();
            var finalCount = await DbContext.Recipes.CountAsync();
            var deleted = await DbContext.Recipes.FindAsync(newId);

            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteRecipe_ShouldThrowNotFoundException_WhenNotFound()
        {
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _mealPlannerService.DeleteRecipe(99999));

            Assert.That(exception!.Message, Does.Contain("Recipe with ID 99999 not found"));
        }

        // ===== Meal Plan Tests =====

        [Test]
        public async Task GetMealPlan_ShouldReturnEntriesInDateRange()
        {
            var startDate = DateTime.UtcNow.Date;
            var endDate = DateTime.UtcNow.Date.AddDays(7);

            var result = await _mealPlannerService.GetMealPlan(startDate, endDate);
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Entries, Is.Not.Empty);
        }

        [Test]
        public async Task GetMealPlan_ShouldReturnEmptyArray_WhenNoEntriesInRange()
        {
            var startDate = DateTime.UtcNow.Date.AddDays(100);
            var endDate = DateTime.UtcNow.Date.AddDays(107);

            var result = await _mealPlannerService.GetMealPlan(startDate, endDate);
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Entries, Is.Empty);
        }

        [Test]
        public async Task GetMealPlan_ShouldIncludeRecipeName()
        {
            var startDate = DateTime.UtcNow.Date;
            var endDate = DateTime.UtcNow.Date.AddDays(7);

            var result = await _mealPlannerService.GetMealPlan(startDate, endDate);
            var entry = result.Entries.First();
            Assert.That(entry.RecipeName, Is.Not.Null.And.Not.Empty);
        }

        [Test]
        public async Task GetMealPlan_ShouldReturnEntriesOrderedByDate()
        {
            var startDate = DateTime.UtcNow.Date;
            var endDate = DateTime.UtcNow.Date.AddDays(7);

            var result = await _mealPlannerService.GetMealPlan(startDate, endDate);
            var dates = result.Entries.Select(e => e.Date).ToArray();
            Assert.That(dates, Is.EqualTo(dates.OrderBy(d => d).ToArray()));
        }

        [Test]
        public async Task AddMealPlanEntry_ShouldAddEntry()
        {
            var initialCount = await DbContext.MealPlanEntries.CountAsync();
            var recipe = await DbContext.Recipes.FirstAsync();

            await _mealPlannerService.AddMealPlanEntry(new AddMealPlanEntryRequest
            {
                Date = DateTime.UtcNow.Date.AddDays(3),
                MealType = "Breakfast",
                RecipeId = recipe.Id
            });

            var finalCount = await DbContext.MealPlanEntries.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task AddMealPlanEntry_ShouldReturnNewEntryId()
        {
            var recipe = await DbContext.Recipes.FirstAsync();

            var newId = await _mealPlannerService.AddMealPlanEntry(new AddMealPlanEntryRequest
            {
                Date = DateTime.UtcNow.Date.AddDays(4),
                MealType = "Lunch",
                RecipeId = recipe.Id
            });

            Assert.That(newId, Is.GreaterThan(0));
        }

        [Test]
        public async Task AddMealPlanEntry_ShouldThrowNotFoundException_WhenRecipeNotFound()
        {
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _mealPlannerService.AddMealPlanEntry(new AddMealPlanEntryRequest
                {
                    Date = DateTime.UtcNow.Date,
                    MealType = "Dinner",
                    RecipeId = 99999
                }));

            Assert.That(exception!.Message, Does.Contain("Recipe with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteMealPlanEntry_ShouldDeleteEntry()
        {
            var entry = await DbContext.MealPlanEntries.FirstAsync();
            var entryId = entry.Id;
            var initialCount = await DbContext.MealPlanEntries.CountAsync();

            await _mealPlannerService.DeleteMealPlanEntry(entryId);
            DbContext.ChangeTracker.Clear();

            var deleted = await DbContext.MealPlanEntries.FindAsync(entryId);
            var finalCount = await DbContext.MealPlanEntries.CountAsync();
            Assert.That(deleted, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteMealPlanEntry_ShouldThrowNotFoundException_WhenNotFound()
        {
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _mealPlannerService.DeleteMealPlanEntry(99999));

            Assert.That(exception!.Message, Does.Contain("Meal plan entry with ID 99999 not found"));
        }

        // ===== Cook History Tests =====

        [Test]
        public async Task LogCook_ShouldAddHistoryEntry()
        {
            var recipe = await DbContext.Recipes.FirstAsync();
            var initialCount = await DbContext.RecipeCookHistory.CountAsync(h => h.RecipeId == recipe.Id);

            await _mealPlannerService.LogCook(recipe.Id);

            var finalCount = await DbContext.RecipeCookHistory.CountAsync(h => h.RecipeId == recipe.Id);
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task LogCook_ShouldReturnNewEntryId()
        {
            var recipe = await DbContext.Recipes.FirstAsync();
            var entryId = await _mealPlannerService.LogCook(recipe.Id);
            Assert.That(entryId, Is.GreaterThan(0));
        }

        [Test]
        public async Task LogCook_ShouldSetCookedAtToUtcNow()
        {
            var recipe = await DbContext.Recipes.FirstAsync();
            var beforeLog = DateTime.UtcNow.AddSeconds(-1);

            var entryId = await _mealPlannerService.LogCook(recipe.Id);

            var afterLog = DateTime.UtcNow.AddSeconds(1);
            var entry = await DbContext.RecipeCookHistory.FindAsync(entryId);
            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.CookedAt, Is.GreaterThan(beforeLog));
            Assert.That(entry.CookedAt, Is.LessThan(afterLog));
        }

        [Test]
        public async Task LogCook_ShouldThrowNotFoundException_WhenRecipeNotFound()
        {
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _mealPlannerService.LogCook(99999));

            Assert.That(exception!.Message, Does.Contain("Recipe with ID 99999 not found"));
        }

        [Test]
        public async Task GetCookHistory_ShouldReturnHistoryForRecipe()
        {
            var recipe = await DbContext.Recipes.FirstAsync(r => r.Name == "Spaghetti Bolognese");
            var result = await _mealPlannerService.GetCookHistory(recipe.Id);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.History, Is.Not.Empty);
            Assert.That(result.History.Length, Is.EqualTo(2));
        }

        [Test]
        public async Task GetCookHistory_ShouldReturnEmptyArray_WhenNoHistory()
        {
            var recipe = await DbContext.Recipes.FirstAsync(r => r.Name == "Cheese Omelette");
            var result = await _mealPlannerService.GetCookHistory(recipe.Id);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.History, Is.Empty);
        }

        [Test]
        public async Task GetCookHistory_ShouldReturnHistoryOrderedByMostRecent()
        {
            var recipe = await DbContext.Recipes.FirstAsync(r => r.Name == "Spaghetti Bolognese");
            var result = await _mealPlannerService.GetCookHistory(recipe.Id);

            var dates = result.History.Select(h => h.CookedAt).ToArray();
            Assert.That(dates, Is.EqualTo(dates.OrderByDescending(d => d).ToArray()));
        }

        [Test]
        public async Task GetCookHistory_ShouldIncludeRecipeName()
        {
            var recipe = await DbContext.Recipes.FirstAsync(r => r.Name == "Spaghetti Bolognese");
            var result = await _mealPlannerService.GetCookHistory(recipe.Id);

            Assert.That(result.History.All(h => h.RecipeName == "Spaghetti Bolognese"), Is.True);
        }

        // ===== Integration Tests =====

        [Test]
        public async Task AddRecipeAndLogCook_ShouldReflectInGetRecipes()
        {
            var newId = await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Integration Test Recipe",
                Description = "For testing"
            });

            await _mealPlannerService.LogCook(newId);
            await _mealPlannerService.LogCook(newId);

            var recipes = await _mealPlannerService.GetRecipes();
            var recipe = recipes.Recipes.First(r => r.Name == "Integration Test Recipe");
            Assert.That(recipe.TimesCooked, Is.EqualTo(2));
            Assert.That(recipe.LastCooked, Is.Not.Null);
        }

        [Test]
        public async Task AddRecipeAndScheduleMeal_ShouldAppearInMealPlan()
        {
            var newId = await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Scheduled Meal Test",
                Description = "For testing"
            });

            var tomorrow = DateTime.UtcNow.Date.AddDays(1);
            await _mealPlannerService.AddMealPlanEntry(new AddMealPlanEntryRequest
            {
                Date = tomorrow,
                MealType = "Dinner",
                RecipeId = newId
            });

            var mealPlan = await _mealPlannerService.GetMealPlan(tomorrow, tomorrow);
            Assert.That(mealPlan.Entries.Any(e => e.RecipeName == "Scheduled Meal Test"), Is.True);
        }

        [Test]
        public async Task AddRecipe_ShouldHandleSpecialCharacters()
        {
            await _mealPlannerService.AddRecipe(new AddRecipeRequest
            {
                Name = "Crème Brûlée 🍮",
                Description = "French dessert with café vibes"
            });

            var recipe = await DbContext.Recipes.FirstOrDefaultAsync(r => r.Name.Contains("Crème"));
            Assert.That(recipe, Is.Not.Null);
            Assert.That(recipe.Name, Does.Contain("🍮"));
        }
    }
}
