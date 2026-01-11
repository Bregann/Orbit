using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Enums;
using Orbit.Domain.Services.MoodTracker;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.MoodTracker
{
    [TestFixture]
    public class MoodTrackerServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private MoodTrackerService _moodTrackerService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntries(DbContext);

            _moodTrackerService = new MoodTrackerService(DbContext);
        }

        [Test]
        public async Task GetTodaysMood_ShouldReturnNoMood_WhenNoEntryForToday()
        {
            // Act
            var result = await _moodTrackerService.GetTodaysMood();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.HasMoodToday, Is.False);
            Assert.That(result.Mood, Is.Null);
            Assert.That(result.RecordedAt, Is.Null);
        }

        [Test]
        public async Task GetTodaysMood_ShouldReturnMood_WhenEntryExistsForToday()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Excellent, DateTime.UtcNow);

            // Act
            var result = await _moodTrackerService.GetTodaysMood();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.HasMoodToday, Is.True);
            Assert.That(result.Mood, Is.EqualTo(MoodTrackerEnum.Excellent));
            Assert.That(result.RecordedAt, Is.Not.Null);
        }

        [Test]
        public async Task GetTodaysMood_ShouldOnlyReturnTodaysEntry_NotPreviousDays()
        {
            // Arrange
            // Seed data already has entries from previous days
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Good, DateTime.UtcNow);

            // Act
            var result = await _moodTrackerService.GetTodaysMood();

            // Assert
            Assert.That(result.Mood, Is.EqualTo(MoodTrackerEnum.Good));
            Assert.That(result.RecordedAt!.Value.Date, Is.EqualTo(DateTime.UtcNow.Date));
        }

        [Test]
        public async Task RecordMood_ShouldAddNewMoodEntry()
        {
            // Arrange
            var initialCount = await DbContext.MoodTrackerEntries.CountAsync();

            // Act
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Excellent);

            // Assert
            var finalCount = await DbContext.MoodTrackerEntries.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));
        }

        [Test]
        public async Task RecordMood_ShouldSaveWithCorrectMoodType()
        {
            // Arrange
            var mood = MoodTrackerEnum.Good;

            // Act
            await _moodTrackerService.RecordMood(mood);

            // Assert
            var entry = await DbContext.MoodTrackerEntries
                .OrderByDescending(e => e.DateRecorded)
                .FirstAsync();

            Assert.That(entry.MoodType, Is.EqualTo(mood));
        }

        [Test]
        public async Task RecordMood_ShouldSetDateRecordedToUtcNow()
        {
            // Arrange
            var beforeRecording = DateTime.UtcNow.AddSeconds(-1);

            // Act
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Neutral);
            var afterRecording = DateTime.UtcNow.AddSeconds(1);

            // Assert
            var entry = await DbContext.MoodTrackerEntries
                .OrderByDescending(e => e.DateRecorded)
                .FirstAsync();

            Assert.That(entry.DateRecorded, Is.GreaterThan(beforeRecording));
            Assert.That(entry.DateRecorded, Is.LessThan(afterRecording));
            Assert.That(entry.DateRecorded.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [TestCase(MoodTrackerEnum.Excellent)]
        [TestCase(MoodTrackerEnum.Good)]
        [TestCase(MoodTrackerEnum.Neutral)]
        [TestCase(MoodTrackerEnum.Low)]
        [TestCase(MoodTrackerEnum.Difficult)]
        public async Task RecordMood_ShouldHandleAllMoodTypes(MoodTrackerEnum mood)
        {
            // Act
            await _moodTrackerService.RecordMood(mood);

            // Assert
            var entry = await DbContext.MoodTrackerEntries
                .OrderByDescending(e => e.DateRecorded)
                .FirstAsync();

            Assert.That(entry.MoodType, Is.EqualTo(mood));
        }

        [Test]
        public async Task RecordMood_ShouldUpdateExistingEntry_WhenMoodAlreadyRecordedToday()
        {
            // Arrange
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Good);
            var initialCount = await DbContext.MoodTrackerEntries
                .Where(e => e.DateRecorded.Date == DateTime.UtcNow.Date)
                .CountAsync();

            // Act
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Excellent);

            // Assert
            var finalCount = await DbContext.MoodTrackerEntries
                .Where(e => e.DateRecorded.Date == DateTime.UtcNow.Date)
                .CountAsync();

            Assert.That(finalCount, Is.EqualTo(initialCount)); // Should not create new entry

            var todaysMood = await _moodTrackerService.GetTodaysMood();
            Assert.That(todaysMood.Mood, Is.EqualTo(MoodTrackerEnum.Excellent)); // Should be updated
        }

        [Test]
        public async Task GetYearlyMood_ShouldReturnAllEntriesForYear()
        {
            // Arrange
            var targetYear = DateTime.UtcNow.Year;
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Excellent, new DateTime(targetYear, 1, 15));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Good, new DateTime(targetYear, 6, 20));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Neutral, new DateTime(targetYear, 12, 25));

            // Act
            var result = await _moodTrackerService.GetYearlyMood(targetYear);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Year, Is.EqualTo(targetYear));
            Assert.That(result.Entries.Count, Is.GreaterThanOrEqualTo(3));
            Assert.That(result.Entries.Any(e => e.Mood == MoodTrackerEnum.Excellent), Is.True);
            Assert.That(result.Entries.Any(e => e.Mood == MoodTrackerEnum.Good), Is.True);
            Assert.That(result.Entries.Any(e => e.Mood == MoodTrackerEnum.Neutral), Is.True);
        }

        [Test]
        public async Task GetYearlyMood_ShouldReturnEmptyList_WhenNoEntriesForYear()
        {
            // Arrange
            var futureYear = DateTime.UtcNow.Year + 10;

            // Act
            var result = await _moodTrackerService.GetYearlyMood(futureYear);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Year, Is.EqualTo(futureYear));
            Assert.That(result.Entries, Is.Empty);
        }

        [Test]
        public async Task GetYearlyMood_ShouldOnlyReturnEntriesForSpecifiedYear()
        {
            // Arrange
            var targetYear = DateTime.UtcNow.Year;
            var previousYear = targetYear - 1;

            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Excellent, new DateTime(targetYear, 6, 15));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Good, new DateTime(previousYear, 6, 15));

            // Act
            var result = await _moodTrackerService.GetYearlyMood(targetYear);

            // Assert
            Assert.That(result.Entries.All(e => e.Date.Year == targetYear), Is.True);
            Assert.That(result.Entries.Any(e => e.Date.Year == previousYear), Is.False);
        }

        [Test]
        public async Task GetYearlyMood_ShouldReturnEntriesInChronologicalOrder()
        {
            // Arrange
            var targetYear = DateTime.UtcNow.Year;

            // Add entries in non-chronological order
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Neutral, new DateTime(targetYear, 12, 1));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Good, new DateTime(targetYear, 3, 1));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Excellent, new DateTime(targetYear, 1, 1));

            // Act
            var result = await _moodTrackerService.GetYearlyMood(targetYear);

            // Assert
            for (int i = 1; i < result.Entries.Count; i++)
            {
                Assert.That(result.Entries[i].Date, Is.GreaterThanOrEqualTo(result.Entries[i - 1].Date));
            }
        }

        [Test]
        public async Task GetAvailableYears_ShouldReturnAllYearsWithEntries()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntriesForMultipleYears(DbContext, 2022, 2023, 2024);

            // Act
            var result = await _moodTrackerService.GetAvailableYears();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Years, Is.Not.Empty);
            Assert.That(result.Years.Contains(2022), Is.True);
            Assert.That(result.Years.Contains(2023), Is.True);
            Assert.That(result.Years.Contains(2024), Is.True);
        }

        [Test]
        public async Task GetAvailableYears_ShouldReturnCurrentYear_WhenNoEntries()
        {
            // Arrange - Clear all existing entries
            DbContext.MoodTrackerEntries.RemoveRange(DbContext.MoodTrackerEntries);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _moodTrackerService.GetAvailableYears();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Years, Is.Not.Empty);
            Assert.That(result.Years.Count, Is.EqualTo(1));
            Assert.That(result.Years[0], Is.EqualTo(DateTime.UtcNow.Year));
        }

        [Test]
        public async Task GetAvailableYears_ShouldReturnYearsInDescendingOrder()
        {
            // Arrange
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntriesForMultipleYears(DbContext, 2020, 2023, 2021);

            // Act
            var result = await _moodTrackerService.GetAvailableYears();

            // Assert
            for (int i = 1; i < result.Years.Count; i++)
            {
                Assert.That(result.Years[i], Is.LessThan(result.Years[i - 1]));
            }
        }

        [Test]
        public async Task GetAvailableYears_ShouldNotReturnDuplicateYears()
        {
            // Arrange - Multiple entries in same year
            var year = 2023;
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Good, new DateTime(year, 1, 1));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Excellent, new DateTime(year, 6, 15));
            await TestDatabaseSeedHelper.SeedTestMoodTrackerEntry(DbContext, MoodTrackerEnum.Neutral, new DateTime(year, 12, 31));

            // Act
            var result = await _moodTrackerService.GetAvailableYears();

            // Assert
            var yearCount = result.Years.Count(y => y == year);
            Assert.That(yearCount, Is.EqualTo(1));
        }

        [Test]
        public async Task RecordMoodForDate_ShouldCreateNewEntry_ForPastDate()
        {
            // Arrange
            var pastDate = DateTime.UtcNow.AddDays(-6);
            var initialCount = await DbContext.MoodTrackerEntries.CountAsync();

            // Act
            await _moodTrackerService.RecordMoodForDate(MoodTrackerEnum.Good, pastDate);

            // Assert
            var finalCount = await DbContext.MoodTrackerEntries.CountAsync();
            Assert.That(finalCount, Is.EqualTo(initialCount + 1));

            var entry = await DbContext.MoodTrackerEntries
                .FirstOrDefaultAsync(e => e.DateRecorded.Date == pastDate.Date);
            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.MoodType, Is.EqualTo(MoodTrackerEnum.Good));
        }

        [Test]
        public async Task RecordMoodForDate_ShouldUpdateExistingEntry_WhenEntryExistsForDate()
        {
            // Arrange
            var targetDate = await DbContext.MoodTrackerEntries.FirstAsync();

            var initialCount = await DbContext.MoodTrackerEntries
                .Where(e => e.DateRecorded.Date == targetDate.DateRecorded.Date)
                .CountAsync();

            // Act
            await _moodTrackerService.RecordMoodForDate(MoodTrackerEnum.Excellent, targetDate.DateRecorded);

            // because it uses ExecuteUpdateAsync which bypasses tracking
            // we need to clear the change tracker to avoid stale data
            DbContext.ChangeTracker.Clear();

            // Assert
            var finalCount = await DbContext.MoodTrackerEntries
                .Where(e => e.DateRecorded.Date == targetDate.DateRecorded.Date)
                .CountAsync();

            Assert.That(finalCount, Is.EqualTo(initialCount)); // Should not create duplicate

            var entry = await DbContext.MoodTrackerEntries
                .FirstOrDefaultAsync(e => e.DateRecorded.Date == targetDate.DateRecorded.Date);

            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.MoodType, Is.EqualTo(MoodTrackerEnum.Excellent));
        }

        [Test]
        public async Task RecordMoodForDate_ShouldThrowInvalidOperationException_ForFutureDate()
        {
            // Arrange
            var futureDate = DateTime.UtcNow.AddDays(1);

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _moodTrackerService.RecordMoodForDate(MoodTrackerEnum.Good, futureDate));

            Assert.That(exception.Message, Does.Contain("Cannot record mood for future dates"));
        }

        [Test]
        public async Task RecordMoodForDate_ShouldHandleToday()
        {
            // Arrange
            var today = DateTime.UtcNow.Date;

            // Act
            await _moodTrackerService.RecordMoodForDate(MoodTrackerEnum.Excellent, today);

            // Assert
            var entry = await DbContext.MoodTrackerEntries
                .FirstOrDefaultAsync(e => e.DateRecorded.Date == today);
            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.MoodType, Is.EqualTo(MoodTrackerEnum.Excellent));
        }

        [TestCase(MoodTrackerEnum.Excellent)]
        [TestCase(MoodTrackerEnum.Good)]
        [TestCase(MoodTrackerEnum.Neutral)]
        [TestCase(MoodTrackerEnum.Low)]
        [TestCase(MoodTrackerEnum.Difficult)]
        public async Task RecordMoodForDate_ShouldHandleAllMoodTypes(MoodTrackerEnum mood)
        {
            // Arrange
            var pastDate = DateTime.UtcNow.AddDays(-2);

            // Act
            await _moodTrackerService.RecordMoodForDate(mood, pastDate);

            // Assert
            var entry = await DbContext.MoodTrackerEntries
                .FirstOrDefaultAsync(e => e.DateRecorded.Date == pastDate.Date);
            Assert.That(entry, Is.Not.Null);
            Assert.That(entry.MoodType, Is.EqualTo(mood));
        }

        [Test]
        public async Task RecordMoodForDate_ShouldUseUtcDateKind()
        {
            // Arrange
            var pastDate = DateTime.UtcNow.AddDays(-1);

            // Act
            await _moodTrackerService.RecordMoodForDate(MoodTrackerEnum.Good, pastDate);

            // Assert
            var entry = await DbContext.MoodTrackerEntries
                .OrderByDescending(e => e.DateRecorded)
                .FirstAsync();
            Assert.That(entry.DateRecorded.Kind, Is.EqualTo(DateTimeKind.Utc));
        }

        [Test]
        public async Task RecordMoodForDate_ShouldAllowMultipleEntriesInSameYear()
        {
            // Arrange
            var year = DateTime.UtcNow.Year;
            var dates = Enumerable.Range(1, 5)
                .Select(day => new DateTime(year, 1, day))
                .ToList();

            // Act
            foreach (var date in dates)
            {
                await _moodTrackerService.RecordMoodForDate(MoodTrackerEnum.Good, date);
            }

            // Assert
            var yearlyData = await _moodTrackerService.GetYearlyMood(year);
            Assert.That(yearlyData.Entries.Count(e => e.Date.Month == 1), Is.GreaterThanOrEqualTo(5));
        }
    }
}
