using Microsoft.EntityFrameworkCore;
using Npgsql;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.DTOs.MoodTracker;
using Orbit.Domain.Enums;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.MoodTracker;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Services.MoodTracker
{
    public class MoodTrackerService(AppDbContext context) : IMoodTrackerService
    {
        public async Task<GetTodaysMoodResponse> GetTodaysMood()
        {
            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

            var moodEntry = await context.MoodTrackerEntries
                .Where(me => me.DateRecorded.Date == today)
                .Select(me => new GetTodaysMoodResponse
                {
                    Mood = me.MoodType,
                    HasMoodToday = true,
                    RecordedAt = DateTime.SpecifyKind(me.DateRecorded, DateTimeKind.Utc)
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
                    Date = DateTime.SpecifyKind(me.DateRecorded.Date, DateTimeKind.Utc),
                    Mood = me.MoodType,
                    RecordedAt = DateTime.SpecifyKind(me.DateRecorded, DateTimeKind.Utc)
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

        public async Task RecordMood(MoodTrackerEnum mood, DateOnly date)
        {
            if (date > DateOnly.FromDateTime(DateTime.UtcNow.Date))
            {
                throw new BadRequestException("Cannot record mood for future dates.");
            }

            var targetDate = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);

            var existingEntry = await context.MoodTrackerEntries
                .FirstOrDefaultAsync(me => me.DateRecorded.Date == targetDate);

            if (existingEntry != null)
            {
                existingEntry.MoodType = mood;
            }
            else
            {
                var newEntry = new MoodTrackerEntry
                {
                    MoodType = mood,
                    DateRecorded = targetDate
                };

                await context.MoodTrackerEntries.AddAsync(newEntry);
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
            {
                // Duplicate key — another request beat us, update instead
                var existingEntry = await context.MoodTrackerEntries
                    .FirstAsync(me => me.DateRecorded.Date == targetDate);
                existingEntry.MoodType = mood;
                await context.SaveChangesAsync();
            }
        }

        public async Task RecordMoodForDate(MoodTrackerEnum mood, DateTime date)
        {
            if (date.Date > DateTime.UtcNow.Date)
            {
                throw new BadRequestException("Cannot record mood for future dates.");
            }

            var targetDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

            var existingEntry = await context.MoodTrackerEntries
                .FirstOrDefaultAsync(me => me.DateRecorded.Date == targetDate);

            if (existingEntry != null)
            {
                existingEntry.MoodType = mood;
            }
            else
            {
                var newEntry = new MoodTrackerEntry
                {
                    MoodType = mood,
                    DateRecorded = targetDate
                };

                await context.MoodTrackerEntries.AddAsync(newEntry);
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
            {
                // Duplicate key — another request beat us, update instead
                var existingEntry = await context.MoodTrackerEntries
                    .FirstAsync(me => me.DateRecorded.Date == targetDate);
                existingEntry.MoodType = mood;
                await context.SaveChangesAsync();
            }
        }
    }
}
