using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.MealPlanner;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.MealPlanner;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.MealPlanner
{
    public class MealPlannerService(AppDbContext context) : IMealPlannerService
    {
        public async Task<GetRecipesResponse> GetRecipes()
        {
            var recipes = await context.Recipes
                .Select(r => new RecipeItem
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Ingredients = r.Ingredients.Select(i => new RecipeIngredientDto
                    {
                        Name = i.Name,
                        Quantity = i.Quantity
                    }).ToArray(),
                    Steps = r.Steps.OrderBy(s => s.StepNumber).Select(s => new RecipeStepDto
                    {
                        StepNumber = s.StepNumber,
                        Instruction = s.Instruction
                    }).ToArray(),
                    PrepTimeMinutes = r.PrepTimeMinutes,
                    CookTimeMinutes = r.CookTimeMinutes,
                    Servings = r.Servings,
                    CreatedAt = r.CreatedAt,
                    LastUpdatedAt = r.LastUpdatedAt,
                    TimesCooked = r.CookHistory.Count,
                    LastCooked = r.CookHistory
                        .OrderByDescending(h => h.CookedAt)
                        .Select(h => (DateTime?)h.CookedAt)
                        .FirstOrDefault()
                })
                .OrderBy(r => r.Name)
                .ToArrayAsync();

            return new GetRecipesResponse { Recipes = recipes };
        }

        public async Task<RecipeItem> GetRecipe(int recipeId)
        {
            var recipe = await context.Recipes
                .Where(r => r.Id == recipeId)
                .Select(r => new RecipeItem
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Ingredients = r.Ingredients.Select(i => new RecipeIngredientDto
                    {
                        Name = i.Name,
                        Quantity = i.Quantity
                    }).ToArray(),
                    Steps = r.Steps.OrderBy(s => s.StepNumber).Select(s => new RecipeStepDto
                    {
                        StepNumber = s.StepNumber,
                        Instruction = s.Instruction
                    }).ToArray(),
                    PrepTimeMinutes = r.PrepTimeMinutes,
                    CookTimeMinutes = r.CookTimeMinutes,
                    Servings = r.Servings,
                    CreatedAt = r.CreatedAt,
                    LastUpdatedAt = r.LastUpdatedAt,
                    TimesCooked = r.CookHistory.Count,
                    LastCooked = r.CookHistory
                        .OrderByDescending(h => h.CookedAt)
                        .Select(h => (DateTime?)h.CookedAt)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (recipe == null)
            {
                throw new NotFoundException($"Recipe with ID {recipeId} not found.");
            }

            return recipe;
        }

        public async Task<int> AddRecipe(AddRecipeRequest request)
        {
            var newRecipe = new Recipe
            {
                Name = request.Name,
                Description = request.Description,
                PrepTimeMinutes = request.PrepTimeMinutes,
                CookTimeMinutes = request.CookTimeMinutes,
                Servings = request.Servings,
                CreatedAt = DateTime.UtcNow,
                Ingredients = request.Ingredients?.Select(i => new Database.Models.RecipeIngredient
                {
                    Name = i.Name,
                    Quantity = i.Quantity
                }).ToList() ?? [],
                Steps = request.Steps?.Select(s => new RecipeStep
                {
                    StepNumber = s.StepNumber,
                    Instruction = s.Instruction
                }).ToList() ?? []
            };

            context.Recipes.Add(newRecipe);
            await context.SaveChangesAsync();

            Log.Information($"Added new recipe: {request.Name}");

            return newRecipe.Id;
        }

        public async Task UpdateRecipe(UpdateRecipeRequest request)
        {
            var recipe = await context.Recipes
                .Include(r => r.Ingredients)
                .Include(r => r.Steps)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            if (recipe == null)
            {
                throw new NotFoundException($"Recipe with ID {request.Id} not found.");
            }

            recipe.Name = request.Name;
            recipe.Description = request.Description;
            recipe.PrepTimeMinutes = request.PrepTimeMinutes;
            recipe.CookTimeMinutes = request.CookTimeMinutes;
            recipe.Servings = request.Servings;
            recipe.LastUpdatedAt = DateTime.UtcNow;

            // Replace ingredients
            context.RecipeIngredients.RemoveRange(recipe.Ingredients);
            recipe.Ingredients = request.Ingredients?.Select(i => new Database.Models.RecipeIngredient
            {
                RecipeId = recipe.Id,
                Name = i.Name,
                Quantity = i.Quantity
            }).ToList() ?? [];

            // Replace steps
            context.RecipeSteps.RemoveRange(recipe.Steps);
            recipe.Steps = request.Steps?.Select(s => new RecipeStep
            {
                RecipeId = recipe.Id,
                StepNumber = s.StepNumber,
                Instruction = s.Instruction
            }).ToList() ?? [];

            await context.SaveChangesAsync();

            Log.Information($"Updated recipe with ID {request.Id}.");
        }

        public async Task DeleteRecipe(int recipeId)
        {
            var rowsAffected = await context.Recipes
                .Where(r => r.Id == recipeId)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new NotFoundException($"Recipe with ID {recipeId} not found.");
            }

            Log.Information($"Deleted recipe with ID {recipeId}.");
        }

        public async Task<GetMealPlanResponse> GetMealPlan(DateTime startDate, DateTime endDate)
        {
            var utcStart = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
            var utcEnd = DateTime.SpecifyKind(endDate, DateTimeKind.Utc).AddDays(1).AddTicks(-1);

            var entries = await context.MealPlanEntries
                .Where(e => e.Date >= utcStart && e.Date <= utcEnd)
                .Select(e => new MealPlanItem
                {
                    Id = e.Id,
                    Date = e.Date,
                    MealType = e.MealType,
                    RecipeId = e.RecipeId,
                    RecipeName = e.Recipe.Name
                })
                .OrderBy(e => e.Date)
                .ThenBy(e => e.MealType)
                .ToArrayAsync();

            return new GetMealPlanResponse
            {
                Entries = entries
            };
        }

        public async Task<int> AddMealPlanEntry(AddMealPlanEntryRequest request)
        {
            var recipeExists = await context.Recipes.AnyAsync(r => r.Id == request.RecipeId);

            if (!recipeExists)
            {
                throw new NotFoundException($"Recipe with ID {request.RecipeId} not found.");
            }

            var newEntry = new Database.Models.MealPlanEntry
            {
                Date = request.Date.Kind == DateTimeKind.Utc ? request.Date : DateTime.SpecifyKind(request.Date.Date, DateTimeKind.Utc),
                MealType = request.MealType,
                RecipeId = request.RecipeId
            };

            context.MealPlanEntries.Add(newEntry);
            await context.SaveChangesAsync();

            Log.Information($"Added meal plan entry for {request.Date:yyyy-MM-dd} ({request.MealType}).");

            return newEntry.Id;
        }

        public async Task DeleteMealPlanEntry(int entryId)
        {
            var rowsAffected = await context.MealPlanEntries
                .Where(e => e.Id == entryId)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new NotFoundException($"Meal plan entry with ID {entryId} not found.");
            }

            Log.Information($"Deleted meal plan entry with ID {entryId}.");
        }

        public async Task<int> LogCook(int recipeId)
        {
            var recipeExists = await context.Recipes.AnyAsync(r => r.Id == recipeId);

            if (!recipeExists)
            {
                throw new NotFoundException($"Recipe with ID {recipeId} not found.");
            }

            var entry = new Database.Models.RecipeCookHistory
            {
                RecipeId = recipeId,
                CookedAt = DateTime.UtcNow
            };

            context.RecipeCookHistory.Add(entry);
            await context.SaveChangesAsync();

            Log.Information($"Logged cook for recipe ID {recipeId}.");

            return entry.Id;
        }

        public async Task<GetCookHistoryResponse> GetCookHistory(int recipeId)
        {
            var history = await context.RecipeCookHistory
                .Where(h => h.RecipeId == recipeId)
                .Select(h => new CookHistoryItem
                {
                    Id = h.Id,
                    CookedAt = h.CookedAt,
                    RecipeId = h.RecipeId,
                    RecipeName = h.Recipe.Name
                })
                .OrderByDescending(h => h.CookedAt)
                .ToArrayAsync();

            return new GetCookHistoryResponse
            {
                History = history
            };
        }

        public async Task AddRecipeIngredientsToShoppingList(int recipeId)
        {
            var ingredients = await context.RecipeIngredients
                .Where(i => i.RecipeId == recipeId)
                .ToListAsync();

            if (ingredients.Count == 0)
            {
                throw new NotFoundException($"Recipe with ID {recipeId} has no ingredients.");
            }

            var shoppingItems = ingredients.Select(i => new ShoppingListItem
            {
                Name = string.IsNullOrWhiteSpace(i.Quantity) ? i.Name : $"{i.Name} ({i.Quantity})",
                AddedAt = DateTime.UtcNow,
                IsPurchased = false
            }).ToList();

            context.ShoppingListItems.AddRange(shoppingItems);
            await context.SaveChangesAsync();

            Log.Information($"Added {shoppingItems.Count} ingredients from recipe ID {recipeId} to shopping list.");
        }
    }
}
