using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.MoodTracker
{
    public class MoodEntryDto
    {
        public required DateTime Date { get; set; }
        public required MoodTrackerEnum Mood { get; set; }
        public required DateTime RecordedAt { get; set; }
    }
}
