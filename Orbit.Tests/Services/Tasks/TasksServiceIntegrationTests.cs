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
        private TasksService _tasksService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestTasks(DbContext);

            _tasksService = new TasksService(DbContext);
        }

        [Test]
        public async Task GetTasks_ShouldReturnAllTasks()
        {
            // Act
            var result = await _tasksService.GetTasks();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Tasks, Is.Not.Empty);
            Assert.That(result.Tasks, Is.Not.Empty);
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
            await _tasksService.AddNewTask(request);

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
            await _tasksService.CompleteTask(taskId);

            // Assert
            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var completedTask = await DbContext.Tasks.FindAsync(taskId);
            Assert.That(completedTask, Is.Not.Null);
            Assert.That(completedTask.CompletedAt, Is.Not.Null);
            Assert.That(completedTask.CompletedAt.Value.Date, Is.EqualTo(DateTime.UtcNow.Date));
        }

        [Test]
        public async Task CompleteTask_ShouldThrowKeyNotFoundException_WhenTaskNotFound()
        {
            // Arrange
            var nonExistentTaskId = 99999;

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () => 
                await _tasksService.CompleteTask(nonExistentTaskId));

            Assert.That(exception.Message, Does.Contain($"Task with ID {nonExistentTaskId} not found"));
        }

        [Test]
        public async Task DeleteTask_ShouldRemoveTask()
        {
            // Arrange
            var task = DbContext.Tasks.First();
            var taskId = task.Id;
            var initialCount = await DbContext.Tasks.CountAsync();

            // Act
            await _tasksService.DeleteTask(taskId);

            // Assert
            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var deletedTask = await DbContext.Tasks.FindAsync(taskId);
            var finalCount = await DbContext.Tasks.CountAsync();

            Assert.That(deletedTask, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteTask_ShouldThrowKeyNotFoundException_WhenTaskNotFound()
        {
            // Arrange
            var nonExistentTaskId = 99999;

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () => 
                await _tasksService.DeleteTask(nonExistentTaskId));

            Assert.That(exception.Message, Does.Contain($"Task with ID {nonExistentTaskId} not found"));
        }

        [Test]
        public async Task GetTaskCategories_ShouldReturnAllCategories()
        {
            // Act
            var result = await _tasksService.GetTaskCategories();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Categories, Is.Not.Empty);
            Assert.That(result.Categories.Any(c => c.Name == "Test Work"), Is.True);
            Assert.That(result.Categories.Any(c => c.Name == "Test Personal"), Is.True);
        }

        [Test]
        public async Task AddNewCategory_ShouldCreateNewCategory()
        {
            // Arrange
            var request = new AddNewCategoryRequest
            {
                Name = "New Test Category"
            };

            // Act
            var categoryId = await _tasksService.AddNewCategory(request);

            // Assert
            var category = await DbContext.TaskCategories.FindAsync(categoryId);
            Assert.That(category, Is.Not.Null);
            Assert.That(category.Name, Is.EqualTo("New Test Category"));
        }

        [Test]
        public async Task AddNewCategory_ShouldThrowInvalidOperationException_WhenCategoryAlreadyExists()
        {
            // Arrange
            var request = new AddNewCategoryRequest
            {
                Name = "Test Work"
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () => 
                await _tasksService.AddNewCategory(request));

            Assert.That(exception.Message, Does.Contain("Category with name 'Test Work' already exists"));
        }

        [Test]
        public async Task DeleteCategory_ShouldRemoveCategory()
        {
            // Arrange
            var category = DbContext.TaskCategories.First();
            var categoryId = category.Id;
            var initialCount = await DbContext.TaskCategories.CountAsync();

            // Act
            await _tasksService.DeleteCategory(categoryId);

            // Assert
            // because it uses ExecuteDeleteAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            var deletedCategory = await DbContext.TaskCategories.FindAsync(categoryId);
            var finalCount = await DbContext.TaskCategories.CountAsync();

            Assert.That(deletedCategory, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteCategory_ShouldThrowKeyNotFoundException_WhenCategoryNotFound()
        {
            // Arrange
            var nonExistentCategoryId = 99999;

            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () => 
                await _tasksService.DeleteCategory(nonExistentCategoryId));

            Assert.That(exception.Message, Does.Contain($"Category with ID {nonExistentCategoryId} not found"));
        }
    }
}
