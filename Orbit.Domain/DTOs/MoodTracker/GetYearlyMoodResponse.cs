namespace Orbit.Domain.DTOs.MoodTracker
{
    public class GetYearlyMoodResponse
    {
        public required List<MoodEntryDto> Entries { get; set; }
        public required int Year { get; set; }
    }
}
