using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.MoodTracker
{
    public class RecordMoodRequest
    {
        public required MoodTrackerEnum Mood { get; set; }
    }
}
