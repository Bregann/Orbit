using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.MoodTracker;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces.Api.MoodTracker;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.MoodTracker
{
    public class MoodTrackerService(AppDbContext context) : IMoodTrackerService
    {
        public async Task<GetTodaysMoodResponse> GetTodaysMood()
        {
            var today = DateTime.UtcNow.Date;

            var moodEntry = await context.MoodTrackerEntries
                .Where(me => me.DateRecorded.Date == today)
                .Select(me => new GetTodaysMoodResponse
                {
                    Mood = me.MoodType,
                    HasMoodToday = true,
                    RecordedAt = me.DateRecorded
                })
                .FirstOrDefaultAsync();

            return moodEntry ?? new GetTodaysMoodResponse { Mood = null, HasMoodToday = false, RecordedAt = null };
        }

        public async Task<GetYearlyMoodResponse> GetYearlyMood(int year)
        {
            var startOfYear = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfYear = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

            var entries = await context.MoodTrackerEntries
                .Where(me => me.DateRecorded >= startOfYear && me.DateRecorded <= endOfYear)
                .OrderBy(me => me.DateRecorded)
                .Select(me => new MoodEntryDto
                {
                    Date = me.DateRecorded.Date,
                    Mood = me.MoodType,
                    RecordedAt = me.DateRecorded
                })
                .ToListAsync();

            return new GetYearlyMoodResponse
            {
                Entries = entries,
                Year = year
            };
        }

        public async Task<GetAvailableYearsResponse> GetAvailableYears()
        {
            var years = await context.MoodTrackerEntries
                .Select(me => me.DateRecorded.Year)
                .Distinct()
                .OrderByDescending(year => year)
                .ToListAsync();

            if (years.Count == 0)
            {
                years.Add(DateTime.UtcNow.Year);
            }

            return new GetAvailableYearsResponse
            {
                Years = years
            };
        }

        public async Task RecordMood(MoodTrackerEnum mood)
        {
            var today = DateTime.UtcNow.Date;
            var existingEntry = await context.MoodTrackerEntries
                .FirstOrDefaultAsync(me => me.DateRecorded.Date == today);

            if (existingEntry != null)
            {
                existingEntry.MoodType = mood;
                existingEntry.DateRecorded = DateTime.UtcNow;
            }
            else
            {
                var newEntry = new MoodTrackerEntry
                {
                    MoodType = mood,
                    DateRecorded = DateTime.UtcNow
                };

                await context.MoodTrackerEntries.AddAsync(newEntry);
            }

            await context.SaveChangesAsync();
        }

        public async Task RecordMoodForDate(MoodTrackerEnum mood, DateTime date)
        {
            if (date.Date > DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException("Cannot record mood for future dates.");
            }

            var targetDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            var existingEntry = await context.MoodTrackerEntries
                .FirstOrDefaultAsync(me => me.DateRecorded.Date == targetDate.Date);

            if (existingEntry != null)
            {
                existingEntry.MoodType = mood;
                existingEntry.DateRecorded = DateTime.UtcNow;
            }
            else
            {
                var newEntry = new MoodTrackerEntry
                {
                    MoodType = mood,
                    DateRecorded = DateTime.SpecifyKind(date, DateTimeKind.Utc)
                };

                await context.MoodTrackerEntries.AddAsync(newEntry);
            }

            await context.SaveChangesAsync();
        }
    }
}
