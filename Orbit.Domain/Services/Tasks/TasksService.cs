using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Tasks;
using Orbit.Domain.Interfaces.Api.Tasks;

namespace Orbit.Domain.Services.Tasks
{
    public class TasksService(AppDbContext context) : ITasksService
    {
        public async Task<GetTasksResponse> GetTasks()
        {
            var tasks = await context.Tasks
                .Select(t => new TaskItem
                {
                    Id = t.Id,
                    Title = t.Name,
                    Description = t.Description,
                    DateCompleted = t.CompletedAt,
                    DueDate = t.DueDate,
                    Priority = t.Priority,
                    TaskCategoryId = t.TaskCategoryId
                })
                .ToArrayAsync();

            return new GetTasksResponse
            {
                Tasks = tasks
            };
        }

        public async Task<int> AddNewTask(AddTaskRequest request)
        {
            var newTask = new Database.Models.Task
            {
                Name = request.Title,
                Description = request.Description,
                TaskCategoryId = request.TaskCategoryId,
                Priority = request.Priority,
                DueDate = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null,
                CreatedAt = DateTime.UtcNow
            };

            context.Tasks.Add(newTask);
            await context.SaveChangesAsync();

            return newTask.Id;
        }

        public async Task DeleteTask(int taskId)
        {
            var changes = await context.Tasks
                 .Where(t => t.Id == taskId)
                 .ExecuteDeleteAsync();

            if (changes == 0)
            {
                throw new KeyNotFoundException($"Task with ID {taskId} not found.");
            }
        }

        public async Task CompleteTask(int taskId)
        {
            var changes = await context.Tasks
                .Where(t => t.Id == taskId)
                .ExecuteUpdateAsync(t => t.SetProperty(task => task.CompletedAt, DateTime.UtcNow));

            if (changes == 0)
            {
                throw new KeyNotFoundException($"Task with ID {taskId} not found.");
            }
        }

        public async Task<GetTaskCategoriesResponse> GetTaskCategories()
        {
            var categories = await context.TaskCategories
                .Select(c => new TaskCategoryItem
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToArrayAsync();

            return new GetTaskCategoriesResponse
            {
                Categories = categories
            };
        }

        public async Task<int> AddNewCategory(AddNewCategoryRequest request)
        {
            var existingCategory = await context.TaskCategories
                .AnyAsync(c => c.Name.ToLower() == request.Name.ToLower());

            if (existingCategory)
            {
                throw new InvalidOperationException($"Category with name '{request.Name}' already exists.");
            }

            var newCategory = new Database.Models.TaskCategory
            {
                Name = request.Name
            };

            context.TaskCategories.Add(newCategory);
            await context.SaveChangesAsync();

            return newCategory.Id;
        }

        public async Task DeleteCategory(int categoryId)
        {
            var changes = await context.TaskCategories
                .Where(c => c.Id == categoryId)
                .ExecuteDeleteAsync();

            if (changes == 0)
            {
                throw new KeyNotFoundException($"Category with ID {categoryId} not found.");
            }
        }
    }
}
