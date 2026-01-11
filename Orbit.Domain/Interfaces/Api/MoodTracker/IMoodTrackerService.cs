using Orbit.Domain.DTOs.MoodTracker;
using Orbit.Domain.Enums;

namespace Orbit.Domain.Interfaces.Api.MoodTracker
{
    public interface IMoodTrackerService
    {
        Task<GetTodaysMoodResponse> GetTodaysMood();
        Task<GetYearlyMoodResponse> GetYearlyMood(int year);
        Task<GetAvailableYearsResponse> GetAvailableYears();
        Task RecordMood(MoodTrackerEnum mood);
        Task RecordMoodForDate(MoodTrackerEnum mood, DateTime date);
    }
}
