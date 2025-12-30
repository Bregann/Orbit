using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.MoodTracker
{
    public class GetTodaysMoodResponse
    {
        public required bool HasMoodToday { get; set; }
        public MoodTrackerEnum? Mood { get; set; }
        public DateTime? RecordedAt { get; set; }
    }
}
