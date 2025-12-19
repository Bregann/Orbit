# Orbit Test Infrastructure Guide

## Overview
This test project uses **NUnit**, **Testcontainers**, and **Moq** to provide comprehensive testing capabilities.

## Test Structure

### 1. Infrastructure Components

#### `TestContainerSetup.cs`
- **Purpose**: Manages the PostgreSQL container lifecycle for ALL tests
- **Scope**: `[SetUpFixture]` - runs once for the entire test suite
- **Usage**: Automatically starts/stops the container; you don't need to interact with it directly

#### `DatabaseIntegrationTestBase.cs`
- **Purpose**: Base class for integration tests requiring a real database
- **Features**:
  - Automatically creates a fresh database for each test
  - Provides `DbContext` property
  - Implements `SetUp` and `TearDown` automatically
- **Usage**: Inherit from this class for integration tests

#### `TestDatabaseSeedHelper.cs`
- **Purpose**: Seeds test-specific data (separate from production seed data)
- **Features**:
  - Focused, minimal test data
  - Reusable seed methods
  - `ClearAllData()` for cleanup
- **Usage**: Call methods in your test's `CustomSetUp()`

#### `MockFactory.cs`
- **Purpose**: Creates commonly used mocks
- **Features**:
  - Pre-configured mocks for common interfaces
  - Consistent mock setup across tests
- **Usage**: `var mock = MockFactory.CreateUserContextHelper();`

## Test Types

### Integration Tests (with Real Database)
Use `DatabaseIntegrationTestBase` when testing:
- Services that interact with the database
- Complex queries and transactions
- Database relationships and constraints

```csharp
[TestFixture]
public class MyServiceIntegrationTests : DatabaseIntegrationTestBase
{
    private MyService _sut;
    
    protected override async Task CustomSetUp()
    {
        // Seed data
        await TestDatabaseSeedHelper.SeedTestUser(DbContext);
        
        // Create service
        _sut = new MyService(DbContext, mockDependency);
    }
    
    [Test]
    public async Task MyTest()
    {
        // Arrange, Act, Assert
    }
}
```

### Unit Tests (with Mocked Database)
Use standard NUnit with mocked `DbContext` when testing:
- Business logic without database interaction
- Service methods that can be isolated
- Faster tests that don't need real data

```csharp
[TestFixture]
public class MyServiceUnitTests
{
    private Mock<AppDbContext> _mockDbContext;
    private MyService _sut;
    
    [SetUp]
    public void SetUp()
    {
        _mockDbContext = new Mock<AppDbContext>();
        _sut = new MyService(_mockDbContext.Object);
    }
    
    [Test]
    public void MyTest()
    {
        // Arrange, Act, Assert
    }
}
```

## Best Practices

### 1. Seed Data Strategy
? **DO**: Use `TestDatabaseSeedHelper` for test data
? **DON'T**: Use production `DatabaseSeedHelper` in tests

### 2. Test Isolation
? **DO**: Each test gets a fresh database (automatic)
? **DO**: Tests can run in parallel (each uses the same container but fresh DB)
? **DON'T**: Rely on data from other tests

### 3. Mock Usage
? **DO**: Use `MockFactory` for common mocks
? **DO**: Mock external dependencies (APIs, services)
? **DON'T**: Mock the database in integration tests

### 4. Test Naming
```csharp
[Test]
public async Task MethodName_Scenario_ExpectedResult()
{
    // Example: GetTasks_WhenUserHasTasks_ShouldReturnTasks()
}
```

## Running Tests

### From Visual Studio
- Test Explorer ? Run All Tests
- Container starts automatically on first test run
- Container stops when test session ends

### From Command Line
```bash
dotnet test
```

### Debugging Tests
- Set breakpoints in your tests
- Right-click ? Debug Test(s)
- Full debugging support with real database

## Example Scenarios

### Testing a Create Operation
```csharp
[Test]
public async Task CreateTransaction_ShouldPersistToDatabase()
{
    // Arrange
    var request = new CreateTransactionRequest { /* ... */ };
    
    // Act
    await _sut.CreateTransaction(request);
    
    // Assert
    var transaction = await DbContext.Transactions
        .FirstOrDefaultAsync(t => t.MerchantName == request.MerchantName);
    Assert.That(transaction, Is.Not.Null);
}
```

### Testing with Multiple Contexts
```csharp
[Test]
public async Task Update_ShouldBeVisibleInNewContext()
{
    // Arrange & Act
    await _sut.UpdateSomething(id);
    
    // Assert - verify with fresh context
    using var newContext = CreateNewContext();
    var updated = await newContext.Something.FindAsync(id);
    Assert.That(updated.IsModified, Is.True);
}
```

### Testing Relationships
```csharp
[Test]
public async Task GetTransactions_ShouldIncludePotData()
{
    // Arrange
    await TestDatabaseSeedHelper.SeedTestPots(DbContext);
    await TestDatabaseSeedHelper.SeedTestTransactions(DbContext);
    
    // Act
    var result = await _sut.GetTransactionsWithPots();
    
    // Assert
    Assert.That(result.First().PotName, Is.Not.Null);
}
```

## Performance Tips

1. **Integration tests are slower** - use sparingly for critical paths
2. **Unit tests are faster** - prefer these for business logic
3. **Container reuse** - container starts once and is shared
4. **Minimize seeding** - only seed data you need for each test

## Troubleshooting

### Container won't start
- Check Docker Desktop is running
- Verify port 5432 isn't already in use

### Tests fail with connection errors
- Ensure `[SetUpFixture]` is working (check test output)
- Verify connection string in test output

### Slow test execution
- Reduce amount of seeded data
- Consider unit tests instead of integration tests
- Check if tests can run in parallel

## Adding New Tests

1. Choose test type (integration vs unit)
2. Create test class with appropriate base class
3. Use `TestDatabaseSeedHelper` for data
4. Use `MockFactory` for mocks
5. Follow naming conventions
6. Add assertions using NUnit's fluent syntax

## Questions?
Refer to the example test files:
- `TransactionsServiceIntegrationTests.cs` - Integration test example
- `PotsServiceUnitTests.cs` - Unit test example
- `TasksServiceIntegrationTests.cs` - Full CRUD example
