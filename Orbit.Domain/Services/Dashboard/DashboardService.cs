using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Dashboard;
using Orbit.Domain.Extensions;
using Orbit.Domain.Interfaces.Api.Dashboard;

namespace Orbit.Domain.Services.Dashboard
{
    public class DashboardService(AppDbContext context) : IDashboardService
    {
        public async Task<GetDashboardOverviewDataDto> GetDashboardOverviewData()
        {
            var moneyLeft = await context.SpendingPots.SumAsync(sp => sp.PotAmountLeft);
            var moneySpent = await context.SpendingPots.SumAsync(sp => sp.PotAmountSpent);
            var tasksCompleted = await context.Tasks.CountAsync(t => t.CompletedAt != null);
            var totalTasks = await context.Tasks.CountAsync();

            var eventsScheduled = await context.CalendarEvents.Where(ce => ce.StartTime >= DateTime.UtcNow).CountAsync();

            var threeDaysAgo = DateTime.UtcNow.AddDays(-3);

            return new GetDashboardOverviewDataDto
            {
                MoneyLeft = moneyLeft.ToPoundsString(),
                MoneySpent = moneySpent.ToPoundsString(),
                TasksCompleted = tasksCompleted,
                TotalTasks = totalTasks,
                EventsScheduled = eventsScheduled,
                UpcomingTasks = await context.Tasks
                    .Where(t => t.CompletedAt == null || t.CompletedAt > threeDaysAgo)
                    .OrderBy(t => t.DueDate)
                    .ThenByDescending(t => t.Priority)
                    .Select(t => new UpcomingTasksData
                    {
                        TaskId = t.Id,
                        TaskTitle = t.Name,
                        Priority = t.Priority,
                        IsCompleted = t.CompletedAt != null,
                        DueDate = t.DueDate
                    })
                    .Take(5)
                    .ToArrayAsync(),
                UpcomingEvents = await context.CalendarEvents
                    .Where(ce => ce.StartTime > DateTime.UtcNow.AddDays(-3))
                    .OrderBy(ce => ce.StartTime)
                    .Select(ce => new UpcomingEventsData
                    {
                        EventId = ce.Id,
                        EventTitle = ce.EventName,
                        EventDate = ce.StartTime,
                        IsAllDay = ce.IsAllDay
                    })
                    .Take(5)
                    .ToArrayAsync()
            };
        }
    }
}
