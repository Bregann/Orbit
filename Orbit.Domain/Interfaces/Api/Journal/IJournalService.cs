using Orbit.Domain.DTOs.Journal;

namespace Orbit.Domain.Interfaces.Api.Journal
{
    public interface IJournalService
    {
        Task CreateJournalEntry(CreateJournalEntryRequest request);
        Task DeleteJournalEntry(int id);
        Task<GetJournalEntriesDto> GetJournalEntries();
    }
}
