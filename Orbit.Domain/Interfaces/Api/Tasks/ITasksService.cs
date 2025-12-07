using Orbit.Domain.DTOs.Tasks;
using System;
using System.Collections.Generic;
using System.Text;

namespace Orbit.Domain.Interfaces.Api.Tasks
{
    public interface ITasksService
    {
        Task<int> AddNewCategory(AddNewCategoryRequest request);
        Task<int> AddNewTask(AddTaskRequest request);
        Task CompleteTask(int taskId);
        Task DeleteCategory(int categoryId);
        Task DeleteTask(int taskId);
        Task<GetTaskCategoriesResponse> GetTaskCategories();
        Task<GetTasksResponse> GetTasks();
    }
}
