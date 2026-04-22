using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Domain.Database.Models
{
    public class Recipe
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Description { get; set; }

        public int? PrepTimeMinutes { get; set; }

        public int? CookTimeMinutes { get; set; }

        public int? Servings { get; set; }

        [Required]
        public required DateTime CreatedAt { get; set; }

        public DateTime? LastUpdatedAt { get; set; }

        public virtual ICollection<RecipeIngredient> Ingredients { get; set; } = null!;

        public virtual ICollection<RecipeStep> Steps { get; set; } = null!;

        public virtual ICollection<MealPlanEntry> MealPlanEntries { get; set; } = null!;

        public virtual ICollection<RecipeCookHistory> CookHistory { get; set; } = null!;
    }
}
