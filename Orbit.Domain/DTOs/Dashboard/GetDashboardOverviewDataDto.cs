using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Dashboard
{
    public class GetDashboardOverviewDataDto
    {
        public required string MoneyLeft { get; set; }
        public required string MoneySpent { get; set; }
        public required int TasksCompleted { get; set; }
        public required int TotalTasks { get; set; }
        public required int EventsScheduled { get; set; }
        public required TodaysTasksData[] TodaysTasks { get; set; }
        public required UpcomingEventsData[] UpcomingEvents { get; set; }

    }

    public class TodaysTasksData
    {
        public required int TaskId { get; set; }
        public required string TaskTitle { get; set; }
        public required TaskPriorityType Priority { get; set; }
        public required bool IsCompleted { get; set; }
    }

    public class UpcomingEventsData
    {
        public required int EventId { get; set; }
        public required string EventTitle { get; set; }
        public required DateTime EventDate { get; set; }
    }
}
