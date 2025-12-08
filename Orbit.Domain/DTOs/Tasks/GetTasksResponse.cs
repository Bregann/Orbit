using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Tasks
{
    public class GetTasksResponse
    {
        public required TaskItem[] Tasks { get; set; }
    }

    public class TaskItem
    {
        public required int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required int TaskCategoryId { get; set; }
        public required TaskPriorityType Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? DateCompleted { get; set; }
    }
}
