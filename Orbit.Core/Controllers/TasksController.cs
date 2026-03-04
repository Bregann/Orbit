using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Domain.DTOs.Tasks;
using Orbit.Domain.Interfaces.Api.Tasks;

namespace Orbit.Core.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class TasksController(ITasksService tasksService) : ControllerBase
    {
        [HttpGet]
        public async Task<GetTasksResponse> GetTasks()
        {
            return await tasksService.GetTasks();
        }

        [HttpPost]
        public async Task<IActionResult> AddNewTask([FromBody] AddTaskRequest request)
        {
            var newTaskId = await tasksService.AddNewTask(request);
            return Ok(newTaskId);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteTask([FromQuery] int taskId)
        {
            await tasksService.DeleteTask(taskId);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> CompleteTask([FromQuery] int taskId)
        {
            await tasksService.CompleteTask(taskId);
            return Ok();
        }

        [HttpGet]
        public async Task<GetTaskCategoriesResponse> GetTaskCategories()
        {
            return await tasksService.GetTaskCategories();
        }

        [HttpPost]
        public async Task<IActionResult> AddNewCategory([FromBody] AddNewCategoryRequest request)
        {
            var newCategoryId = await tasksService.AddNewCategory(request);
            return Ok(newCategoryId);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteCategory([FromQuery] int categoryId)
        {
            await tasksService.DeleteCategory(categoryId);
            return Ok();
        }
    }
}
