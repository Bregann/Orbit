using Orbit.Domain.Enums;

namespace Orbit.Domain.DTOs.Journal
{
    public class GetJournalEntriesDto
    {
        public required JournalEntryItem[] Entries { get; set; }
    }

    public class JournalEntryItem
    {
        public required int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required JournalMoodEnum Mood { get; set; }
    }
}
