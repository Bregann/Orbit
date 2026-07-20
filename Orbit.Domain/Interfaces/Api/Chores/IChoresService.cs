using Orbit.Domain.DTOs.Chores;

namespace Orbit.Domain.Interfaces.Api.Chores
{
    public interface IChoresService
    {
        Task<int> AddChore(AddChoreRequest request);
        Task CompleteChore(int choreId);
        Task DeleteChore(int choreId);
        Task<GetChoresResponse> GetChores();
        Task UpdateChore(UpdateChoreRequest request);
    }
}
