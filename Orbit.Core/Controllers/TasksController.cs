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
            try
            {
                var newTaskId = await tasksService.AddNewTask(request);
                return Ok(newTaskId);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteTask([FromQuery] int taskId)
        {
            try
            {
                await tasksService.DeleteTask(taskId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPatch]
        public async Task<IActionResult> CompleteTask([FromQuery] int taskId)
        {
            try
            {
                await tasksService.CompleteTask(taskId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet]
        public async Task<GetTaskCategoriesResponse> GetTaskCategories()
        {
            return await tasksService.GetTaskCategories();
        }

        [HttpPost]
        public async Task<IActionResult> AddNewCategory([FromBody] AddNewCategoryRequest request)
        {
            try
            {
                var newCategoryId = await tasksService.AddNewCategory(request);
                return Ok(newCategoryId);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteCategory([FromQuery] int categoryId)
        {
            try
            {
                await tasksService.DeleteCategory(categoryId);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
