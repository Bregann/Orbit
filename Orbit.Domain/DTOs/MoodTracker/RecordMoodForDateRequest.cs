using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.MoodTracker
{
    public class RecordMoodForDateRequest
    {
        public required MoodTrackerEnum Mood { get; set; }
        public required DateTime Date { get; set; }
    }
}
