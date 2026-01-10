using Microsoft.EntityFrameworkCore;
using Orbit.Domain.DTOs.Finance.Pots.Request;
using Orbit.Domain.Services.Finance;
using Orbit.Tests.Infrastructure;

namespace Orbit.Tests.Services.Finance
{
    [TestFixture]
    public class PotsServiceIntegrationTests : DatabaseIntegrationTestBase
    {
        private PotsService _potsService = null!;

        protected override async Task CustomSetUp()
        {
            await TestDatabaseSeedHelper.SeedTestUser(DbContext);
            await TestDatabaseSeedHelper.SeedTestPots(DbContext);

            _potsService = new PotsService(DbContext);
        }

        [Test]
        public async Task GetSpendingPotDropdownOptions_ShouldReturnAllSpendingPots()
        {
            // Act
            var result = await _potsService.GetSpendingPotDropdownOptions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.PotOptions, Is.Not.Empty);
            Assert.That(result.PotOptions.Any(p => p.PotName == "Test General"), Is.True);
            Assert.That(result.PotOptions.Any(p => p.PotName == "Test Savings"), Is.True);
        }

        [Test]
        public async Task GetAllPotData_ShouldReturnSpendingAndSavingsPots()
        {
            // Act
            var result = await _potsService.GetAllPotData();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.SpendingPots, Is.Not.Empty);
            Assert.That(result.SavingsPots, Is.Not.Empty);
        }

        [Test]
        public async Task GetAllPotData_ShouldFormatAmountsCorrectly()
        {
            // Act
            var result = await _potsService.GetAllPotData();

            // Assert
            var spendingPot = result.SpendingPots.First(p => p.PotName == "Test General");
            
            // Check that amounts are formatted as currency strings (contains decimal point and two decimal places)
            Assert.That(spendingPot.AmountAllocated, Does.Match(@"^£?\d+\.\d{2}$"));
            Assert.That(spendingPot.AmountLeft, Does.Match(@"^£?\d+\.\d{2}$"));
            Assert.That(spendingPot.AmountSpent, Does.Match(@"^£?\d+\.\d{2}$"));
            
            // Verify the amounts are parseable as decimals (after removing currency symbol)
            var allocatedAmount = decimal.Parse(spendingPot.AmountAllocated.Replace("£", "").Replace("?", ""));
            var leftAmount = decimal.Parse(spendingPot.AmountLeft.Replace("£", "").Replace("?", ""));
            var spentAmount = decimal.Parse(spendingPot.AmountSpent.Replace("£", "").Replace("?", ""));
            
            Assert.That(allocatedAmount, Is.GreaterThanOrEqualTo(0));
            Assert.That(leftAmount, Is.GreaterThanOrEqualTo(0));
            Assert.That(spentAmount, Is.GreaterThanOrEqualTo(0));
        }

        [Test]
        public async Task GetManagePotData_ShouldReturnAllPots()
        {
            // Act
            var result = await _potsService.GetManagePotData();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Pots, Is.Not.Empty);
            Assert.That(result.Pots.Any(p => !p.IsSavingsPot), Is.True);
            Assert.That(result.Pots.Any(p => p.IsSavingsPot), Is.True);
        }

        [Test]
        public async Task GetAddMonthPotData_ShouldReturnAllPotData()
        {
            // Act
            var result = await _potsService.GetAddMonthPotData();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.SpendingPots, Is.Not.Empty);
            Assert.That(result.SavingsPots, Is.Not.Empty);
        }

        [Test]
        public async Task AddNewPot_ShouldCreateSpendingPot()
        {
            // Arrange
            var request = new AddNewPotRequest
            {
                PotName = "New Spending Pot",
                AmountToAdd = 150.00m,
                IsSavingsPot = false,
                RolloverByDefault = true
            };

            // Act
            var potId = await _potsService.AddNewPot(request);

            // Assert
            var pot = await DbContext.SpendingPots.FindAsync(potId);
            Assert.That(pot, Is.Not.Null);
            Assert.That(pot.PotName, Is.EqualTo("New Spending Pot"));
            Assert.That(pot.AmountToAdd, Is.EqualTo(15000)); // £150 in pence
            Assert.That(pot.RolloverDefaultChecked, Is.True);
        }

        [Test]
        public async Task AddNewPot_ShouldCreateSavingsPot()
        {
            // Arrange
            var request = new AddNewPotRequest
            {
                PotName = "New Savings Pot",
                AmountToAdd = 500.00m,
                IsSavingsPot = true,
                RolloverByDefault = false
            };

            // Act
            var potId = await _potsService.AddNewPot(request);

            // Assert
            var pot = await DbContext.SavingsPots.FindAsync(potId);
            Assert.That(pot, Is.Not.Null);
            Assert.That(pot.PotName, Is.EqualTo("New Savings Pot"));
            Assert.That(pot.AmountToAdd, Is.EqualTo(50000)); // £500 in pence
            Assert.That(pot.PotAmount, Is.EqualTo(0));
        }

        [Test]
        public async Task AddNewPot_ShouldThrowArgumentException_WhenPotNameIsEmpty()
        {
            // Arrange
            var request = new AddNewPotRequest
            {
                PotName = "",
                AmountToAdd = 100.00m,
                IsSavingsPot = false,
                RolloverByDefault = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<ArgumentException>(async () =>
                await _potsService.AddNewPot(request));

            Assert.That(exception.Message, Does.Contain("Invalid pot name or amount"));
        }

        [Test]
        public async Task AddNewPot_ShouldThrowArgumentException_WhenAmountIsZeroOrNegative()
        {
            // Arrange
            var request = new AddNewPotRequest
            {
                PotName = "Test Pot",
                AmountToAdd = 0,
                IsSavingsPot = false,
                RolloverByDefault = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<ArgumentException>(async () =>
                await _potsService.AddNewPot(request));

            Assert.That(exception.Message, Does.Contain("Invalid pot name or amount"));
        }

        [Test]
        public async Task AddNewPot_ShouldThrowInvalidOperationException_WhenSpendingPotNameExists()
        {
            // Arrange
            var request = new AddNewPotRequest
            {
                PotName = "Test General", // Already exists in seed data
                AmountToAdd = 100.00m,
                IsSavingsPot = false,
                RolloverByDefault = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _potsService.AddNewPot(request));

            Assert.That(exception.Message, Does.Contain("A spending pot with this name already exists"));
        }

        [Test]
        public async Task AddNewPot_ShouldThrowInvalidOperationException_WhenSavingsPotNameExists()
        {
            // Arrange
            var request = new AddNewPotRequest
            {
                PotName = "Test Emergency Fund", // Already exists in seed data
                AmountToAdd = 100.00m,
                IsSavingsPot = true,
                RolloverByDefault = false
            };

            // Act & Assert
            var exception = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _potsService.AddNewPot(request));

            Assert.That(exception.Message, Does.Contain("A savings pot with this name already exists"));
        }

        [Test]
        public async Task GetSpendingPotDropdownOptions_ShouldReturnEmptyArray_WhenNoPots()
        {
            // Arrange
            DbContext.SpendingPots.RemoveRange(DbContext.SpendingPots);
            await DbContext.SaveChangesAsync();

            // Act
            var result = await _potsService.GetSpendingPotDropdownOptions();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.PotOptions, Is.Empty);
        }
    }
}
