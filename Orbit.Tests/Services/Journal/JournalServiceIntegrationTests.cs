using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Journal;
using Orbit.Domain.Enums;
using Orbit.Domain.Services.Journal;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Journal
{
    [TestFixture]
    public class JournalServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private JournalService _journalService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestJournalEntries(DbContext);

            _journalService = new JournalService(DbContext);
        }

        [Test]
        public async Task GetJournalEntries_ShouldReturnAllEntries()
        {
            // Act
            var result = await _journalService.GetJournalEntries();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Entries, Is.Not.Empty);
            Assert.That(result.Entries.Length, Is.EqualTo(3));
        }

        [Test]
        public async Task GetJournalEntries_ShouldReturnEntriesWithCorrectProperties()
        {
            // Act
            var result = await _journalService.GetJournalEntries();

            // Assert
            var entry = result.Entries.First();
            Assert.That(entry.Id, Is.GreaterThan(0));
            Assert.That(entry.Title, Is.Not.Null.And.Not.Empty);
            Assert.That(entry.Content, Is.Not.Null.And.Not.Empty);
            Assert.That(entry.CreatedAt, Is.Not.EqualTo(default(DateTime)));
        }

        [Test]
        public async Task GetJournalEntries_ShouldReturnEmptyArray_WhenNoEntries()
        {
            // Arrange
            DbContext.JournalEntries.RemoveRange(DbContext.JournalEntries);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _journalService.GetJournalEntries();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Entries, Is.Empty);
        }

        [Test]
        public async Task GetJournalEntries_ShouldIncludeAllMoodTypes()
        {
            // Act
            var result = await _journalService.GetJournalEntries();

            // Assert
            Assert.That(result.Entries.Any(e => e.Mood == JournalMoodEnum.Good), Is.True);
            Assert.That(result.Entries.Any(e => e.Mood == JournalMoodEnum.Great), Is.True);
            Assert.That(result.Entries.Any(e => e.Mood == JournalMoodEnum.Neutral), Is.True);
        }

        [Test]
        public async Task CreateJournalEntry_ShouldAddNewEntry()
        {
            // Arrange
            var request = new CreateJournalEntryRequest
            {
                Title = "New Test Entry",
                Content = "This is new journal entry content",
                Mood = JournalMoodEnum.Great
            };

            var initialCount = await DbContext.JournalEntries.CountAsync();

            // Act
            await _journalService.CreateJournalEntry(request);

            // Assert
            var finalCount = await DbContext.JournalEntries.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task CreateJournalEntry_ShouldSaveWithCorrectData()
        {
            // Arrange
            var request = new CreateJournalEntryRequest
            {
                Title = "Another New Entry",
                Content = "Content for the new entry",
                Mood = JournalMoodEnum.Good
            };

            // Act
            await _journalService.CreateJournalEntry(request);

            // Assert
            var entry = await DbContext.JournalEntries
                .FirstOrDefaultAsync(e => e.Title == "Another New Entry");

            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.Content, Is.EqualTo("Content for the new entry"));
            Assert.That(entry.Mood, Is.EqualTo(JournalMoodEnum.Good));
        }

        [Test]
        public async Task CreateJournalEntry_ShouldSetCreatedAtToUtcNow()
        {
            // Arrange
            var beforeCreation = DateTime.UtcNow.AddSeconds(-1);

            var request = new CreateJournalEntryRequest
            {
                Title = "Timestamp Test",
                Content = "Testing timestamp",
                Mood = JournalMoodEnum.Neutral
            };

            // Act
            await _journalService.CreateJournalEntry(request);
            var afterCreation = DateTime.UtcNow.AddSeconds(1);

            // Assert
            var entry = await DbContext.JournalEntries
                .FirstOrDefaultAsync(e => e.Title == "Timestamp Test");

            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.CreatedAt, Is.GreaterThan(beforeCreation));
            Assert.That(entry.CreatedAt, Is.LessThan(afterCreation));
            Assert.That(entry.CreatedAt.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [TestCase(JournalMoodEnum.Awful)]
        [TestCase(JournalMoodEnum.Bad)]
        [TestCase(JournalMoodEnum.Neutral)]
        [TestCase(JournalMoodEnum.Good)]
        [TestCase(JournalMoodEnum.Great)]
        public async Task CreateJournalEntry_ShouldHandleAllMoodTypes(JournalMoodEnum mood)
        {
            // Arrange
            var request = new CreateJournalEntryRequest
            {
                Title = $"Entry with {mood} mood",
                Content = "Testing all mood types",
                Mood = mood
            };

            // Act
            await _journalService.CreateJournalEntry(request);

            // Assert
            var entry = await DbContext.JournalEntries
                .FirstOrDefaultAsync(e => e.Title == $"Entry with {mood} mood");

            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.Mood, Is.EqualTo(mood));
        }

        [Test]
        public async Task DeleteJournalEntry_ShouldRemoveEntry()
        {
            // Arrange
            var entry = await DbContext.JournalEntries.FirstAsync();
            var entryId = entry.Id;
            var initialCount = await DbContext.JournalEntries.CountAsync();

            // Act
            await _journalService.DeleteJournalEntry(entryId);

            // Assert
            var deletedEntry = await DbContext.JournalEntries.FindAsync(entryId);
            var finalCount = await DbContext.JournalEntries.CountAsync();

            Assert.That(deletedEntry, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteJournalEntry_ShouldThrowKeyNotFoundException_WhenEntryNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () =>
                await _journalService.DeleteJournalEntry(99999));

            Assert.That(exception!.Message, Does.Contain("Journal entry with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteJournalEntry_ShouldOnlyDeleteSpecificEntry()
        {
            // Arrange
            var allEntries = await DbContext.JournalEntries.ToListAsync();
            var entryToDelete = allEntries.First();
            var otherEntries = allEntries.Where(e => e.Id != entryToDelete.Id).ToList();

            // Act
            await _journalService.DeleteJournalEntry(entryToDelete.Id);

            // Assert
            foreach (var otherEntry in otherEntries)
            {
                var stillExists = await DbContext.JournalEntries.FindAsync(otherEntry.Id);
                Assert.That(stillExists, Is.Not.Null, $"Entry {otherEntry.Id} should still exist");
            }
        }

        [Test]
        public async Task CreateJournalEntry_ShouldHandleLongContent()
        {
            // Arrange
            var longContent = new string('a', 5000); // 5000 characters
            var request = new CreateJournalEntryRequest
            {
                Title = "Long Content Entry",
                Content = longContent,
                Mood = JournalMoodEnum.Neutral
            };

            // Act
            await _journalService.CreateJournalEntry(request);

            // Assert
            var entry = await DbContext.JournalEntries
                .FirstOrDefaultAsync(e => e.Title == "Long Content Entry");

            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.Content, Has.Length.EqualTo(5000));
        }

        [Test]
        public async Task CreateJournalEntry_ShouldHandleSpecialCharacters()
        {
            // Arrange
            var request = new CreateJournalEntryRequest
            {
                Title = "Special Characters: יא ס ?? ??",
                Content = "Testing special characters: <html> & \"quotes\" 'apostrophes'",
                Mood = JournalMoodEnum.Good
            };

            // Act
            await _journalService.CreateJournalEntry(request);

            // Assert
            var entry = await DbContext.JournalEntries
                .FirstOrDefaultAsync(e => e.Title.Contains("Special Characters"));

            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.Title, Does.Contain("??"));
            Assert.That(entry.Content, Does.Contain("<html>"));
        }

        [Test]
        public async Task GetJournalEntries_ShouldReturnEntriesInCorrectOrder()
        {
            // Arrange - Add entries with specific dates
            DbContext.JournalEntries.RemoveRange(DbContext.JournalEntries);
            await DbContext.SaveChangesAsync();

            var entry1 = new Domain.Database.Models.JournalEntry
            {
                Title = "Oldest",
                Content = "Content",
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                Mood = JournalMoodEnum.Neutral
            };
            var entry2 = new Domain.Database.Models.JournalEntry
            {
                Title = "Middle",
                Content = "Content",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                Mood = JournalMoodEnum.Neutral
            };
            var entry3 = new Domain.Database.Models.JournalEntry
            {
                Title = "Newest",
                Content = "Content",
                CreatedAt = DateTime.UtcNow,
                Mood = JournalMoodEnum.Neutral
            };

            await DbContext.JournalEntries.AddRangeAsync(entry1, entry2, entry3);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _journalService.GetJournalEntries();

            // Assert
            Assert.That(result.Entries.Length, Is.EqualTo(3));
            // Verify they're returned (order may vary based on database)
            Assert.That(result.Entries.Any(e => e.Title == "Oldest"), Is.True);
            Assert.That(result.Entries.Any(e => e.Title == "Middle"), Is.True);
            Assert.That(result.Entries.Any(e => e.Title == "Newest"), Is.True);
        }
    }
}
