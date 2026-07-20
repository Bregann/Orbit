using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Context;
using Orbit.Domain.DTOs.Chores;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces.Api.Chores;

namespace Orbit.Domain.Services.Chores
{
    public class ChoresService(AppDbContext context) : IChoresService
    {
        public async Task<GetChoresResponse> GetChores()
        {
            var chores = await context.Chores
                .OrderBy(c => c.NextDueDate)
                .Select(c => new ChoreItem
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Frequency = c.Frequency,
                    CustomFrequencyDays = c.CustomFrequencyDays,
                    NextDueDate = c.NextDueDate,
                    LastCompletedAt = c.LastCompletedAt,
                    CreatedAt = c.CreatedAt
                })
                .ToArrayAsync();

            return new GetChoresResponse
            {
                Chores = chores
            };
        }

        public async Task<int> AddChore(AddChoreRequest request)
        {
            var newChore = new Database.Models.Chore
            {
                Name = request.Name,
                Description = request.Description,
                Frequency = request.Frequency,
                CustomFrequencyDays = request.CustomFrequencyDays,
                NextDueDate = DateTime.SpecifyKind(request.NextDueDate, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow
            };

            await context.Chores.AddAsync(newChore);
            await context.SaveChangesAsync();

            return newChore.Id;
        }

        public async Task UpdateChore(UpdateChoreRequest request)
        {
            var changes = await context.Chores
                .Where(c => c.Id == request.Id)
                .ExecuteUpdateAsync(c => c
                    .SetProperty(ch => ch.Name, request.Name)
                    .SetProperty(ch => ch.Description, request.Description)
                    .SetProperty(ch => ch.Frequency, request.Frequency)
                    .SetProperty(ch => ch.CustomFrequencyDays, request.CustomFrequencyDays)
                    .SetProperty(ch => ch.NextDueDate, DateTime.SpecifyKind(request.NextDueDate, DateTimeKind.Utc))
                );

            if (changes == 0)
            {
                throw new NotFoundException($"Chore with ID {request.Id} not found.");
            }
        }

        public async Task CompleteChore(int choreId)
        {
            var chore = await context.Chores
                .FirstOrDefaultAsync(c => c.Id == choreId) ?? throw new NotFoundException($"Chore with ID {choreId} not found.");

            chore.LastCompletedAt = DateTime.UtcNow;

            // Advance next due date from the ORIGINAL due date, not from now.
            // This keeps the schedule anchored — if a weekly chore is done
            // 2 days late, the next due date is still 7 days after the
            // original due date, preserving the intended cadence.
            chore.NextDueDate = chore.Frequency switch
            {
                Enums.ChoreFrequencyType.Daily => chore.NextDueDate.AddDays(1),
                Enums.ChoreFrequencyType.Weekly => chore.NextDueDate.AddDays(7),
                Enums.ChoreFrequencyType.Biweekly => chore.NextDueDate.AddDays(14),
                Enums.ChoreFrequencyType.Monthly => chore.NextDueDate.AddMonths(1),
                Enums.ChoreFrequencyType.SixMonthly => chore.NextDueDate.AddMonths(6),
                Enums.ChoreFrequencyType.Custom => chore.NextDueDate.AddDays(chore.CustomFrequencyDays ?? 7),
                _ => chore.NextDueDate
            };

            await context.SaveChangesAsync();
        }

        public async Task DeleteChore(int choreId)
        {
            var changes = await context.Chores
                .Where(c => c.Id == choreId)
                .ExecuteDeleteAsync();

            if (changes == 0)
            {
                throw new NotFoundException($"Chore with ID {choreId} not found.");
            }
        }
    }
}
