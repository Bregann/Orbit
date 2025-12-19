using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Tasks;
using Orbit.Domain.Enums;
using Orbit.Domain.Services.Tasks;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Tasks
{
    /// <summary>
    /// Example of testing the Tasks service with real database
    /// </summary>
    [TestFixture]
    public class TasksServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private TasksService _sut = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestTasks(DbContext);

            _sut = new TasksService(DbContext);
        }

        [Test]
        public async Task GetTasks_ShouldReturnAllTasks()
        {
            // Act
            var result = await _sut.GetTasks();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Tasks, Is.Not.Empty);
            Assert.That(result.Tasks.Length, Is.GreaterThan(0));
        }

        [Test]
        public async Task AddNewTask_ShouldCreateNewTask()
        {
            // Arrange
            var request = new AddTaskRequest
            {
                Title = "New Test Task",
                Description = "Task created by test",
                Priority = TaskPriorityType.High,
                TaskCategoryId = 1,
                DueDate = DateTime.UtcNow.AddDays(7)
            };

            // Act
            await _sut.AddNewTask(request);

            // Assert
            var tasks = await DbContext.Tasks.ToListAsync();
            var newTask = tasks.FirstOrDefault(t => t.Name == "New Test Task");

            Assert.That(newTask, Is.Not.Null);
            Assert.That(newTask.Description, Is.EqualTo("Task created by test"));
            Assert.That(newTask.Priority, Is.EqualTo(TaskPriorityType.High));
        }

        [Test]
        public async Task CompleteTask_ShouldMarkTaskAsCompleted()
        {
            // Arrange
            var task = DbContext.Tasks.First(t => t.CompletedAt == null);
            var taskId = task.Id;

            // Act
            await _sut.CompleteTask(taskId);

            // Assert
            var completedTask = await DbContext.Tasks.FindAsync(taskId);
            Assert.That(completedTask, Is.Not.Null);
            Assert.That(completedTask.CompletedAt, Is.Not.Null);
            Assert.That(completedTask.CompletedAt.Value.Date, Is.EqualTo(DateTime.UtcNow.Date));
        }

        [Test]
        public async Task DeleteTask_ShouldRemoveTask()
        {
            // Arrange
            var task = DbContext.Tasks.First();
            var taskId = task.Id;
            var initialCount = await DbContext.Tasks.CountAsync();

            // Act
            await _sut.DeleteTask(taskId);

            // Assert
            var deletedTask = await DbContext.Tasks.FindAsync(taskId);
            var finalCount = await DbContext.Tasks.CountAsync();

            Assert.That(deletedTask, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task GetTaskCategories_ShouldReturnAllCategories()
        {
            // Act
            var result = await _sut.GetTaskCategories();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Categories, Is.Not.Empty);
            Assert.That(result.Categories.Any(c => c.Name == "Test Work"), Is.True);
            Assert.That(result.Categories.Any(c => c.Name == "Test Personal"), Is.True);
        }
    }
}
