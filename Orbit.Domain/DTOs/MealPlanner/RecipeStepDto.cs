namespace Orbit.Domain.DTOs.MealPlanner
{
    public class RecipeStepDto
    {
        public required int StepNumber { get; set; }
        public required string Instruction { get; set; }
    }
}
