namespace Orbit.Domain.DTOs.Tasks
{
    public class GetTaskCategoriesResponse
    {
        public required TaskCategoryItem[] Categories { get; set; }
    }

    public class TaskCategoryItem
    {
        public required int Id { get; set; }
        public required string Name { get; set; }
    }
}
