using Microsoft.EntityFrameworkCore;
using Moq;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.Services.Finance;

namespace Orbit.Tests.Services.Finance
{
    /// <summary>
    /// Example unit test using mocked DbContext
    /// Use this approach when you want to test service logic without database
    /// </summary>
    [TestFixture]
    public class PotsServiceUnitTests
    {
        private Mock<AppDbContext> _mockDbContext = null!;
        private PotsService _sut = null!;

        [SetUp]
        public void SetUp()
        {
            // Create mocks
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockDbContext = new Mock<AppDbContext>(options);

            // Create service under test
            _sut = new PotsService(_mockDbContext.Object);
        }

        [Test]
        public void GetAllPotData_WhenCalled_ShouldQueryDatabase()
        {
            // Arrange
            var mockSpendingPotDbSet = CreateMockDbSet(new List<SpendingPot>
            {
                new SpendingPot
                {
                    Id = 1,
                    PotName = "Test Pot",
                    AmountToAdd = 100,
                    PotAmountLeft = 50,
                    PotAmountSpent = 50,
                    RolloverDefaultChecked = true
                }
            });

            var mockSavingsPotDbSet = CreateMockDbSet(new List<SavingsPot>
            {
                new SavingsPot
                {
                    Id = 1,
                    PotName = "Savings Pot",
                    AmountToAdd = 500,
                    PotAmount = 5000
                }
            });

            _mockDbContext.Setup(x => x.SpendingPots).Returns(mockSpendingPotDbSet.Object);
            _mockDbContext.Setup(x => x.SavingsPots).Returns(mockSavingsPotDbSet.Object);

            // Act
            var result = _sut.GetAllPotData();

            // Assert
            Assert.That(result, Is.Not.Null);
            _mockDbContext.Verify(x => x.SpendingPots, Times.Once);
            _mockDbContext.Verify(x => x.SavingsPots, Times.Once);
        }

        private static Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
        {
            var queryable = data.AsQueryable();
            var mockSet = new Mock<DbSet<T>>();

            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());

            return mockSet;
        }
    }
}
