using Orbit.Domain.DTOs.MoodTracker;
using Orbit.Domain.Enums;

namespace Orbit.Domain.Interfaces.Api.MoodTracker
{
    public interface IMoodTrackerService
    {
        Task<GetTodaysMoodResponse> GetTodaysMood();
        Task RecordMood(MoodTrackerEnum mood);
    }
}
