using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.Journal;
using Orbit.Domain.Interfaces.Api.Journal;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.Journal
{
    public class JournalService(AppDbContext context) : IJournalService
    {
        public async Task<GetJournalEntriesDto> GetJournalEntries()
        {
            var entries = await context.JournalEntries
                .Select(entry => new JournalEntryItem
                {
                    Id = entry.Id,
                    Title = entry.Title,
                    Content = entry.Content,
                    CreatedAt = entry.CreatedAt,
                    Mood = entry.Mood
                })
                .ToArrayAsync();

            return new GetJournalEntriesDto
            {
                Entries = entries
            };
        }

        public async Task CreateJournalEntry(CreateJournalEntryRequest request)
        {
            var entry = new JournalEntry
            {
                Title = request.Title,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                Mood = request.Mood
            };

            await context.JournalEntries.AddAsync(entry);
            await context.SaveChangesAsync();

            Log.Information($"Created new journal entry with ID {entry.Id}.");
        }

        public async Task DeleteJournalEntry(int id)
        {
            var rowsAffected = await context.JournalEntries
                .Where(entry => entry.Id == id)
                .ExecuteDeleteAsync();

            if (rowsAffected == 0)
            {
                throw new KeyNotFoundException($"Journal entry with ID {id} not found.");
            }

            Log.Information($"Deleted journal entry with ID {id}.");
        }
    }
}
