using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Services.Dashboard;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Dashboard
{
    [TestFixture]
    public class DashboardServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private DashboardService _dashboardService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);
            await TestDatabaseSeedHelper.SeedTestTasks(DbContext);
            await TestDatabaseSeedHelper.SeedTestCalendarData(DbContext);

            _dashboardService = new DashboardService(DbContext);
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldReturnCompleteOverviewData()
        {
            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.MoneyLeft, Is.Not.Null);
            Assert.That(result.MoneySpent, Is.Not.Null);
            Assert.That(result.TasksCompleted, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.TotalTasks, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.EventsScheduled, Is.GreaterThanOrEqualTo(0));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldCalculateCorrectMoneyLeft()
        {
            // Arrange - Test pots have: General (50 left) + Savings (200 left) = 250 total

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            var expectedMoneyLeft = await DbContext.SpendingPots.SumAsync(sp => sp.PotAmountLeft);
            Assert.That(result.MoneyLeft, Does.Contain(expectedMoneyLeft.ToString("F2")));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldCalculateCorrectMoneySpent()
        {
            // Arrange - Test pots have: General (50 spent) + Savings (0 spent) = 50 total

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            var expectedMoneySpent = await DbContext.SpendingPots.SumAsync(sp => sp.PotAmountSpent);
            Assert.That(result.MoneySpent, Does.Contain(expectedMoneySpent.ToString("F2")));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldCountTasksCorrectly()
        {
            // Arrange - Test data has 1 completed task and 2 total tasks

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            var completedTasksCount = await DbContext.Tasks.CountAsync(t => t.CompletedAt != null);
            var totalTasksCount = await DbContext.Tasks.CountAsync();

            Assert.That(result.TasksCompleted, Is.EqualTo(completedTasksCount));
            Assert.That(result.TotalTasks, Is.EqualTo(totalTasksCount));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldCountUpcomingEventsOnly()
        {
            // Arrange - Add a past event
            await DbContext.CalendarEvents.AddAsync(new Domain.Database.Models.CalendarEvent
            {
                EventName = "Past Event",
                EventLocation = "Old Location",
                Description = "This event is in the past",
                StartTime = DateTime.UtcNow.AddDays(-5),
                EndTime = DateTime.UtcNow.AddDays(-5).AddHours(1),
                IsAllDay = false,
                CalendarEventTypeId = 1
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            var upcomingEventsCount = await DbContext.CalendarEvents
                .CountAsync(ce => ce.StartTime >= DateTime.UtcNow);

            Assert.That(result.EventsScheduled, Is.EqualTo(upcomingEventsCount));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldReturnUpToFiveUpcomingTasks()
        {
            // Arrange - Add more tasks to test the limit
            for (int i = 0; i < 10; i++)
            {
                await DbContext.Tasks.AddAsync(new Domain.Database.Models.Task
                {
                    Name = $"Additional Task {i}",
                    Description = $"Task {i}",
                    Priority = Domain.Enums.TaskPriorityType.Low,
                    TaskCategoryId = 1,
                    DueDate = DateTime.UtcNow.AddDays(i + 10),
                    CreatedAt = DateTime.UtcNow
                });
            }
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingTasks, Is.Not.Null);
            Assert.That(result.UpcomingTasks.Length, Is.LessThanOrEqualTo(5));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldOrderTasksByDueDateThenPriority()
        {
            // Arrange - Clear existing tasks and add specific ones
            DbContext.Tasks.RemoveRange(DbContext.Tasks);
            await DbContext.SaveChangesAsync();

            var baseDate = DateTime.UtcNow;
            await DbContext.Tasks.AddRangeAsync(new[]
            {
                new Domain.Database.Models.Task
                {
                    Name = "Task 1",
                    Description = "Same date, high priority",
                    Priority = Domain.Enums.TaskPriorityType.High,
                    TaskCategoryId = 1,
                    DueDate = baseDate.AddDays(2),
                    CreatedAt = DateTime.UtcNow
                },
                new Domain.Database.Models.Task
                {
                    Name = "Task 2",
                    Description = "Same date, low priority",
                    Priority = Domain.Enums.TaskPriorityType.Low,
                    TaskCategoryId = 1,
                    DueDate = baseDate.AddDays(2),
                    CreatedAt = DateTime.UtcNow
                },
                new Domain.Database.Models.Task
                {
                    Name = "Task 3",
                    Description = "Earlier date",
                    Priority = Domain.Enums.TaskPriorityType.Low,
                    TaskCategoryId = 1,
                    DueDate = baseDate.AddDays(1),
                    CreatedAt = DateTime.UtcNow
                }
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingTasks.Length, Is.EqualTo(3));
            Assert.That(result.UpcomingTasks[0].TaskTitle, Is.EqualTo("Task 3")); // Earlier date first
            Assert.That(result.UpcomingTasks[1].TaskTitle, Is.EqualTo("Task 1")); // Same date, sorted by priority
        }

        [Test]
        public async Task GetDashboardOverviewData_UpcomingTasks_ShouldIncludeCorrectProperties()
        {
            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingTasks, Is.Not.Empty);
            
            var firstTask = result.UpcomingTasks[0];
            Assert.That(firstTask.TaskId, Is.GreaterThan(0));
            Assert.That(firstTask.TaskTitle, Is.Not.Null);
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldReturnUpToFiveUpcomingEvents()
        {
            // Arrange - Add more events to test the limit
            for (int i = 0; i < 10; i++)
            {
                await DbContext.CalendarEvents.AddAsync(new Domain.Database.Models.CalendarEvent
                {
                    EventName = $"Future Event {i}",
                    EventLocation = "Location",
                    Description = $"Event {i}",
                    StartTime = DateTime.UtcNow.AddDays(i + 5),
                    EndTime = DateTime.UtcNow.AddDays(i + 5).AddHours(1),
                    IsAllDay = false,
                    CalendarEventTypeId = 1
                });
            }
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingEvents, Is.Not.Null);
            Assert.That(result.UpcomingEvents.Length, Is.LessThanOrEqualTo(5));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldOrderEventsByStartTime()
        {
            // Arrange - Clear existing events and add specific ones
            DbContext.CalendarEvents.RemoveRange(DbContext.CalendarEvents);
            await DbContext.SaveChangesAsync();

            var baseTime = DateTime.UtcNow.AddDays(1);
            await DbContext.CalendarEvents.AddRangeAsync(new[]
            {
                new Domain.Database.Models.CalendarEvent
                {
                    EventName = "Event 3",
                    EventLocation = "Location",
                    Description = "Third event",
                    StartTime = baseTime.AddHours(6),
                    EndTime = baseTime.AddHours(7),
                    IsAllDay = false,
                    CalendarEventTypeId = 1
                },
                new Domain.Database.Models.CalendarEvent
                {
                    EventName = "Event 1",
                    EventLocation = "Location",
                    Description = "First event",
                    StartTime = baseTime.AddHours(2),
                    EndTime = baseTime.AddHours(3),
                    IsAllDay = false,
                    CalendarEventTypeId = 1
                },
                new Domain.Database.Models.CalendarEvent
                {
                    EventName = "Event 2",
                    EventLocation = "Location",
                    Description = "Second event",
                    StartTime = baseTime.AddHours(4),
                    EndTime = baseTime.AddHours(5),
                    IsAllDay = false,
                    CalendarEventTypeId = 1
                }
            });
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingEvents.Length, Is.EqualTo(3));
            Assert.That(result.UpcomingEvents[0].EventTitle, Is.EqualTo("Event 1"));
            Assert.That(result.UpcomingEvents[1].EventTitle, Is.EqualTo("Event 2"));
            Assert.That(result.UpcomingEvents[2].EventTitle, Is.EqualTo("Event 3"));
        }

        [Test]
        public async Task GetDashboardOverviewData_UpcomingEvents_ShouldIncludeCorrectProperties()
        {
            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingEvents, Is.Not.Empty);
            
            var firstEvent = result.UpcomingEvents[0];
            Assert.That(firstEvent.EventId, Is.GreaterThan(0));
            Assert.That(firstEvent.EventTitle, Is.Not.Null);
            Assert.That(firstEvent.EventDate, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldReturnEmptyArrays_WhenNoTasksOrEvents()
        {
            // Arrange - Clear all tasks and events
            DbContext.Tasks.RemoveRange(DbContext.Tasks);
            DbContext.CalendarEvents.RemoveRange(DbContext.CalendarEvents);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.UpcomingTasks, Is.Not.Null);
            Assert.That(result.UpcomingTasks, Is.Empty);
            Assert.That(result.UpcomingEvents, Is.Not.Null);
            Assert.That(result.UpcomingEvents, Is.Empty);
            Assert.That(result.TasksCompleted, Is.EqualTo(0));
            Assert.That(result.TotalTasks, Is.EqualTo(0));
            Assert.That(result.EventsScheduled, Is.EqualTo(0));
        }

        [Test]
        public async Task GetDashboardOverviewData_ShouldReturnZeroMoney_WhenNoSpendingPots()
        {
            // Arrange - Clear all spending pots
            DbContext.SpendingPots.RemoveRange(DbContext.SpendingPots);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _dashboardService.GetDashboardOverviewData();

            // Assert
            Assert.That(result.MoneyLeft, Does.Contain("0"));
            Assert.That(result.MoneySpent, Does.Contain("0"));
        }
    }
}
