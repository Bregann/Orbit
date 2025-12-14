using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Journal
{
    public class CreateJournalEntryRequest
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public required JournalMoodEnum Mood { get; set; }
    }
}
