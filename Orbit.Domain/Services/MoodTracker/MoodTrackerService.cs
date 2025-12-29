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

        public async Task RecordMood(MoodTrackerEnum mood)
        {
            var today = DateTime.UtcNow.Date;
            var existingEntry = await context.MoodTrackerEntries
                .FirstOrDefaultAsync(me => me.DateRecorded.Date == today);

            if (existingEntry != null)
            {
                throw new InvalidOperationException("Mood for today has already been recorded.");
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
    }
}
