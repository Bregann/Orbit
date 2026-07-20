using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Chores;
using Orbit.Domain.Enums;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Services.Chores;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Chores
{
    [TestFixture]
    public class ChoresServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private ChoresService _choresService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestChores(DbContext);

            _choresService = new ChoresService(DbContext);
        }

        [Test]
        public async Task GetChores_ShouldReturnAllChores()
        {
            // Act
            var result = await _choresService.GetChores();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Chores, Is.Not.Empty);
            Assert.That(result.Chores.Length, Is.EqualTo(3));
        }

        [Test]
        public async Task GetChores_ShouldBeOrderedByNextDueDate()
        {
            // Act
            var result = await _choresService.GetChores();

            // Assert
            var chores = result.Chores;
            for (var i = 1; i < chores.Length; i++)
            {
                Assert.That(chores[i].NextDueDate, Is.GreaterThanOrEqualTo(chores[i - 1].NextDueDate));
            }
        }

        [Test]
        public async Task AddChore_ShouldCreateNewChore()
        {
            // Arrange
            var request = new AddChoreRequest
            {
                Name = "Mop Floors",
                Description = "Mop all hard floors in the house",
                Frequency = ChoreFrequencyType.Weekly,
                NextDueDate = DateTime.UtcNow.AddDays(7)
            };

            // Act
            var choreId = await _choresService.AddChore(request);

            // Assert
            var chore = await DbContext.Chores.FindAsync(choreId);
            Assert.That(chore, Is.Not.Null);
            Assert.That(chore.Name, Is.EqualTo("Mop Floors"));
            Assert.That(chore.Description, Is.EqualTo("Mop all hard floors in the house"));
            Assert.That(chore.Frequency, Is.EqualTo(ChoreFrequencyType.Weekly));
            Assert.That(chore.CreatedAt.Date, Is.EqualTo(DateTime.UtcNow.Date));
        }

        [Test]
        public async Task UpdateChore_ShouldUpdateExistingChore()
        {
            // Arrange
            var existingChore = DbContext.Chores.First();
            var request = new UpdateChoreRequest
            {
                Id = existingChore.Id,
                Name = "Updated Chore Name",
                Description = "Updated description",
                Frequency = ChoreFrequencyType.Daily,
                NextDueDate = DateTime.UtcNow.AddDays(14)
            };

            // Act
            await _choresService.UpdateChore(request);

            // Assert
            DbContext.ChangeTracker.Clear();
            var updatedChore = await DbContext.Chores.FindAsync(existingChore.Id);
            Assert.That(updatedChore, Is.Not.Null);
            Assert.That(updatedChore.Name, Is.EqualTo("Updated Chore Name"));
            Assert.That(updatedChore.Description, Is.EqualTo("Updated description"));
            Assert.That(updatedChore.Frequency, Is.EqualTo(ChoreFrequencyType.Daily));
        }

        [Test]
        public async Task UpdateChore_ShouldThrowNotFoundException_WhenChoreNotFound()
        {
            // Arrange
            var request = new UpdateChoreRequest
            {
                Id = 99999,
                Name = "Nonexistent",
                Description = "Test",
                Frequency = ChoreFrequencyType.Daily,
                NextDueDate = DateTime.UtcNow
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _choresService.UpdateChore(request));

            Assert.That(exception.Message, Does.Contain("Chore with ID 99999 not found"));
        }

        [Test]
        public async Task CompleteChore_ShouldSetLastCompletedAtAndAdvanceNextDueDate()
        {
            // Arrange
            var chore = DbContext.Chores.First(c => c.LastCompletedAt == null);
            var originalNextDueDate = chore.NextDueDate;

            // Act
            await _choresService.CompleteChore(chore.Id);

            // Assert
            DbContext.ChangeTracker.Clear();
            var completedChore = await DbContext.Chores.FindAsync(chore.Id);
            Assert.That(completedChore, Is.Not.Null);
            Assert.That(completedChore.LastCompletedAt, Is.Not.Null);
            Assert.That(completedChore.LastCompletedAt!.Value.Date, Is.EqualTo(DateTime.UtcNow.Date));
            Assert.That(completedChore.NextDueDate, Is.GreaterThan(originalNextDueDate));
        }

        [Test]
        public async Task CompleteChore_WeeklyChore_ShouldAdvanceBy7Days()
        {
            // Arrange
            var chore = DbContext.Chores.First(c => c.Frequency == ChoreFrequencyType.Weekly);
            var originalDueDate = chore.NextDueDate;

            // Act
            await _choresService.CompleteChore(chore.Id);

            // Assert
            DbContext.ChangeTracker.Clear();
            var completedChore = await DbContext.Chores.FindAsync(chore.Id);
            Assert.That(completedChore, Is.Not.Null);
            Assert.That(completedChore.NextDueDate, Is.EqualTo(originalDueDate.AddDays(7)).Within(TimeSpan.FromSeconds(1)));
        }

        [Test]
        public async Task CompleteChore_MonthlyChore_ShouldAdvanceByOneMonth()
        {
            // Arrange
            var chore = DbContext.Chores.First(c => c.Frequency == ChoreFrequencyType.Monthly);
            var originalDueDate = chore.NextDueDate;

            // Act
            await _choresService.CompleteChore(chore.Id);

            // Assert
            DbContext.ChangeTracker.Clear();
            var completedChore = await DbContext.Chores.FindAsync(chore.Id);
            Assert.That(completedChore, Is.Not.Null);
            Assert.That(completedChore.NextDueDate, Is.EqualTo(originalDueDate.AddMonths(1)).Within(TimeSpan.FromSeconds(1)));
        }

        [Test]
        public async Task CompleteChore_ShouldThrowNotFoundException_WhenChoreNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _choresService.CompleteChore(99999));

            Assert.That(exception.Message, Does.Contain("Chore with ID 99999 not found"));
        }

        [Test]
        public async Task DeleteChore_ShouldRemoveChore()
        {
            // Arrange
            var chore = DbContext.Chores.First();
            var choreId = chore.Id;
            var initialCount = await DbContext.Chores.CountAsync();

            // Act
            await _choresService.DeleteChore(choreId);

            // Assert
            DbContext.ChangeTracker.Clear();
            var deletedChore = await DbContext.Chores.FindAsync(choreId);
            var finalCount = await DbContext.Chores.CountAsync();

            Assert.That(deletedChore, Is.Null);
            Assert.That(finalCount, Is.EqualTo(initialCount - 1));
        }

        [Test]
        public async Task DeleteChore_ShouldThrowNotFoundException_WhenChoreNotFound()
        {
            // Act & Assert
            var exception = Assert.ThrowsAsync<NotFoundException>(async () =>
                await _choresService.DeleteChore(99999));

            Assert.That(exception.Message, Does.Contain("Chore with ID 99999 not found"));
        }

        [Test]
        public async Task CompleteChore_LateCompletion_ShouldStillAnchorFromOriginalDueDate()
        {
            // Arrange: set the due date 5 days in the past to simulate a late completion
            var chore = DbContext.Chores.First(c => c.Frequency == ChoreFrequencyType.Weekly);
            var pastDueDate = DateTime.UtcNow.AddDays(-5);
            chore.NextDueDate = pastDueDate;
            await DbContext.SaveChangesAsync();

            // Act
            await _choresService.CompleteChore(chore.Id);

            // Assert: next due date should be 7 days from original due date,
            // NOT 7 days from now (which would be only 2 days ahead since we're 5 days late)
            DbContext.ChangeTracker.Clear();
            var completedChore = await DbContext.Chores.FindAsync(chore.Id);
            Assert.That(completedChore, Is.Not.Null);
            Assert.That(completedChore.LastCompletedAt, Is.Not.Null);
            Assert.That(completedChore.NextDueDate, Is.EqualTo(pastDueDate.AddDays(7)).Within(TimeSpan.FromSeconds(1)));
        }
    }
}
