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
            var todaysMood = new Domain.Database.Models.MoodTrackerEntry
            {
                MoodType = MoodTrackerEnum.Excellent,
                DateRecorded = DateTime.UtcNow
            };
            await DbContext.MoodTrackerEntries.AddAsync(todaysMood);
            await DbContext.SaveChangesAsync();

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
            var todaysMood = new Domain.Database.Models.MoodTrackerEntry
            {
                MoodType = MoodTrackerEnum.Good,
                DateRecorded = DateTime.UtcNow
            };
            await DbContext.MoodTrackerEntries.AddAsync(todaysMood);
            await DbContext.SaveChangesAsync();

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
        public async Task RecordMood_ShouldThrowInvalidOperationException_WhenMoodAlreadyRecordedToday()
        {
            // Arrange
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Good);

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _moodTrackerService.RecordMood(MoodTrackerEnum.Excellent));

            Assert.That(exception!.Message, Does.Contain("Mood for today has already been recorded"));
        }

        [Test]
        public async Task RecordMood_ShouldNotThrow_WhenRecordingForDifferentDays()
        {
            // Arrange - Add yesterday's mood
            var yesterdayMood = new Domain.Database.Models.MoodTrackerEntry
            {
                MoodType = MoodTrackerEnum.Good,
                DateRecorded = DateTime.UtcNow.AddDays(-1)
            };
            await DbContext.MoodTrackerEntries.AddAsync(yesterdayMood);
            await DbContext.SaveChangesAsync();

            // Act & Assert - Should not throw when recording today's mood
            Assert.DoesNotThrowAsync(async () =>
                await _moodTrackerService.RecordMood(MoodTrackerEnum.Excellent));
        }

        [Test]
        public async Task RecordMood_ShouldBeIsolatedByDate()
        {
            // Arrange - Record a mood for today
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Good);

            // Manually add an entry for a different day (simulating next day)
            var tomorrowMood = new Domain.Database.Models.MoodTrackerEntry
            {
                MoodType = MoodTrackerEnum.Excellent,
                DateRecorded = DateTime.UtcNow.AddDays(1)
            };
            await DbContext.MoodTrackerEntries.AddAsync(tomorrowMood);
            await DbContext.SaveChangesAsync();

            // Assert - Both entries should exist
            var todayEntry = await DbContext.MoodTrackerEntries
                .FirstOrDefaultAsync(e => e.DateRecorded.Date == DateTime.UtcNow.Date);
            var tomorrowEntry = await DbContext.MoodTrackerEntries
                .FirstOrDefaultAsync(e => e.DateRecorded.Date == DateTime.UtcNow.AddDays(1).Date);

            Assert.That(todayEntry, Is.Not.Null);
            Assert.That(tomorrowEntry, Is.Not.Null);
            Assert.That(todayEntry.MoodType, Is.EqualTo(MoodTrackerEnum.Good));
            Assert.That(tomorrowEntry.MoodType, Is.EqualTo(MoodTrackerEnum.Excellent));
        }

        [Test]
        public async Task GetTodaysMood_AndRecordMood_ShouldWorkTogether()
        {
            // Arrange - Initially no mood for today
            var initialResult = await _moodTrackerService.GetTodaysMood();
            Assert.That(initialResult.HasMoodToday, Is.False);

            // Act - Record mood
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Excellent);

            // Assert - Now should have mood for today
            var updatedResult = await _moodTrackerService.GetTodaysMood();
            Assert.That(updatedResult.HasMoodToday, Is.True);
            Assert.That(updatedResult.Mood, Is.EqualTo(MoodTrackerEnum.Excellent));
        }

        [Test]
        public async Task GetTodaysMood_ShouldHandleMultipleCallsConsistently()
        {
            // Arrange
            var todaysMood = new Domain.Database.Models.MoodTrackerEntry
            {
                MoodType = MoodTrackerEnum.Good,
                DateRecorded = DateTime.UtcNow
            };
            await DbContext.MoodTrackerEntries.AddAsync(todaysMood);
            await DbContext.SaveChangesAsync();

            // Act
            var result1 = await _moodTrackerService.GetTodaysMood();
            var result2 = await _moodTrackerService.GetTodaysMood();

            // Assert
            Assert.That(result1.HasMoodToday, Is.EqualTo(result2.HasMoodToday));
            Assert.That(result1.Mood, Is.EqualTo(result2.Mood));
        }

        [Test]
        public async Task RecordMood_ShouldNotAffectPreviousDaysEntries()
        {
            // Arrange
            var previousEntriesCount = await DbContext.MoodTrackerEntries.CountAsync();
            var previousEntries = await DbContext.MoodTrackerEntries.ToListAsync();

            // Act
            await _moodTrackerService.RecordMood(MoodTrackerEnum.Excellent);

            // Assert
            var allEntries = await DbContext.MoodTrackerEntries.ToListAsync();
            Assert.That(allEntries.Count, Is.EqualTo(previousEntriesCount + 1));

            // Verify all previous entries still exist with same data
            foreach (var previousEntry in previousEntries)
            {
                var stillExists = allEntries.FirstOrDefault(e => e.Id == previousEntry.Id);
                Assert.That(stillExists, Is.Not.Null);
                Assert.That(stillExists!.MoodType, Is.EqualTo(previousEntry.MoodType));
            }
        }

        [Test]
        public async Task GetTodaysMood_ShouldReturnCorrectTimestamp()
        {
            // Arrange
            var specificTime = DateTime.UtcNow;
            var todaysMood = new Domain.Database.Models.MoodTrackerEntry
            {
                MoodType = MoodTrackerEnum.Good,
                DateRecorded = specificTime
            };
            await DbContext.MoodTrackerEntries.AddAsync(todaysMood);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _moodTrackerService.GetTodaysMood();

            // Assert
            Assert.That(result.RecordedAt, Is.Not.Null);
            Assert.That(result.RecordedAt!.Value.Date, Is.EqualTo(specificTime.Date));
        }
    }
}
