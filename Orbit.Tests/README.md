# Orbit Test Infrastructure Guide

## Overview
This test project uses **NUnit**, **Testcontainers**, and **Moq** to provide integration testing with a real PostgreSQL database.

## Test Structure

### 1. Infrastructure Components

#### `TestContainerSetup.cs`
- **Purpose**: Manages the PostgreSQL container lifecycle for ALL tests
- **Scope**: `[SetUpFixture]` - runs once for the entire test suite
- **Key Details**:
  - Starts a PostgreSQL 16 container before any tests run
  - Automatically cleans up when tests complete
  - Connection string is available via `TestContainerSetup.ConnectionString`

#### `DatabaseIntegrationTestBase.cs`
- **Purpose**: Base class for all integration tests requiring a real database
- **Features**:
  - Automatically creates a **fresh database for each test**
  - Uses **migrations** (not `EnsureCreated`) to ensure lazy loading proxies work
  - Provides `DbContext` property with lazy loading enabled
  - Handles `SetUp` and `TearDown` automatically
  - Supports `CustomSetUp()` and `CustomTearDown()` overrides for test-specific setup
- **Usage**: Inherit from this class for all integration tests

#### `TestDatabaseSeedHelper.cs`
- **Purpose**: Provides reusable seed data methods for tests
- **Features**:
  - Focused, minimal test data
  - Separate methods for seeding different entities (Users, Pots, Transactions, etc.)
  - `ClearAllData()` for cleanup (rarely needed since each test gets a fresh DB)
- **Usage**: Call methods in your test's `CustomSetUp()` or within individual tests

#### `MockFactory.cs`
- **Purpose**: Creates commonly used mocks for external dependencies
- **Available Mocks**:
  - `CreateHttpContextAccessor()` - Mock HTTP context with user claims
  - `CreateUserContextHelper()` - Mock user context helper
  - `CreateEnvironmentalSettingHelper()` - Mock environmental settings
  - `CreateBankApiHelper()` - Mock bank API interactions
  - `CreateFitbitApiHelper()` - Mock Fitbit API calls
  - `CreateCommsSenderClient()` - Mock notification/messaging
  - `CreateMockHttpClient()` - Mock HTTP client for API calls
- **Usage**: Use these to mock external dependencies, not the database

## Writing Integration Tests

All tests in this project are **integration tests** that use a real database. Here's the standard pattern:

```csharp
[TestFixture]
public class MyServiceIntegrationTests : DatabaseIntegrationTestBase
{
    private MyService _sut;
    private Mock<IExternalDependency> _mockDependency;
    
    protected override async Task CustomSetUp()
    {
        // Seed required test data
        await TestDatabaseSeedHelper.SeedTestPots(DbContext);
        
        // Setup mocks for external dependencies
        _mockDependency = MockFactory.CreateSomeMock();
        
        // Create service under test
        _sut = new MyService(DbContext, _mockDependency.Object);
    }
    
    [Test]
    public async Task MethodName_Scenario_ExpectedResult()
    {
        // Arrange - setup test-specific data
        var request = new SomeRequest { /* ... */ };
        
        // Act - call the method being tested
        var result = await _sut.SomeMethod(request);
        
        // Assert - verify the results
        Assert.That(result, Is.Not.Null);
        
        // Verify database changes if needed
        var savedEntity = await DbContext.SomeEntities.FindAsync(result.Id);
        Assert.That(savedEntity.Property, Is.EqualTo(expected));
    }
}
```

## Best Practices

### 1. Test Isolation
? **DO**: Each test automatically gets a fresh database - no need to clean up between tests  
? **DO**: Tests can run in parallel - they share the container but use the same fresh database  
? **DON'T**: Rely on data from other tests or assume a specific test order

### 2. Seed Data Strategy
? **DO**: Use `TestDatabaseSeedHelper` methods to seed test data  
? **DO**: Only seed the minimum data required for your test  
? **DO**: Seed data in `CustomSetUp()` for data needed by all tests in the fixture  
? **DON'T**: Use production seed helpers or seed excessive data

### 3. Mock Usage
? **DO**: Use `MockFactory` for common mocks like `IUserContextHelper`, API helpers  
? **DO**: Mock external dependencies (APIs, file systems, third-party services)  
? **DON'T**: Mock the database - use the real `DbContext` provided by the base class  
? **DON'T**: Mock Entity Framework `DbSet` objects

### 4. Test Naming Convention
```csharp
[Test]
public async Task MethodName_Scenario_ExpectedResult()
{
    // Examples:
    // AddTransaction_WithValidData_ShouldPersistToDatabase()
    // GetTasks_WhenUserHasNoTasks_ShouldReturnEmptyList()
    // DeletePot_WhenPotNotFound_ShouldThrowKeyNotFoundException()
}
```

### 5. Assertions
? **DO**: Use NUnit's fluent assertion syntax: `Assert.That(actual, Is.EqualTo(expected))`  
? **DO**: Verify database state after operations: `await DbContext.Entities.FindAsync(id)`  
? **DO**: Use specific assertions: `Is.Not.Null`, `Is.True`, `Does.Contain`, etc.

## Running Tests

### From Visual Studio
- **Test Explorer** ? Run All Tests
- Container starts automatically on first test run
- Container stops when test session ends
- Right-click on a test ? **Debug Test(s)** for debugging

### From Command Line
```bash
# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "FullyQualifiedName~TransactionsServiceIntegrationTests"

# Run tests matching a pattern
dotnet test --filter "Name~AddTransaction"
```

### Debugging Tests
- Set breakpoints in your test or service code
- Right-click test ? **Debug Test(s)**
- Full debugging support with real database access
- Inspect `DbContext` and database state during debugging

## Example Test Scenarios

### Testing a Create Operation
```csharp
[Test]
public async Task AddTransaction_WithValidData_ShouldPersistToDatabase()
{
    // Arrange
    await TestDatabaseSeedHelper.SeedTestPots(DbContext);
    var request = new AddTransactionRequest
    {
        MerchantName = "Test Merchant",
        Amount = 1000,
        PotId = 1
    };
    
    // Act
    var id = await _sut.AddTransaction(request);
    
    // Assert
    var transaction = await DbContext.Transactions.FindAsync(id);
    Assert.That(transaction, Is.Not.Null);
    Assert.That(transaction.MerchantName, Is.EqualTo("Test Merchant"));
    Assert.That(transaction.TransactionAmount, Is.EqualTo(1000));
}
```

### Testing Exception Handling
```csharp
[Test]
public void DeletePot_WhenPotNotFound_ShouldThrowKeyNotFoundException()
{
    // Arrange
    int nonExistentId = 999;
    
    // Act & Assert
    var exception = Assert.ThrowsAsync<KeyNotFoundException>(
        async () => await _sut.DeletePot(nonExistentId)
    );
    Assert.That(exception.Message, Does.Contain("not found"));
}
```

### Testing with Relationships
```csharp
[Test]
public async Task GetTransactions_ShouldIncludeRelatedPotData()
{
    // Arrange
    await TestDatabaseSeedHelper.SeedTestPots(DbContext);
    await TestDatabaseSeedHelper.SeedTestTransactions(DbContext);
    
    // Act
    var result = await _sut.GetAllTransactions();
    
    // Assert
    Assert.That(result, Is.Not.Empty);
    var transactionWithPot = result.First(t => t.PotId != null);
    Assert.That(transactionWithPot.Pot, Is.Not.Null); // Lazy loading should work
    Assert.That(transactionWithPot.Pot.PotName, Is.Not.Null);
}
```

### Testing Update Operations
```csharp
[Test]
public async Task UpdateTransaction_ShouldModifyExistingRecord()
{
    // Arrange
    await TestDatabaseSeedHelper.SeedTestTransactions(DbContext);
    var existingTransaction = await DbContext.Transactions.FirstAsync();
    var updateRequest = new UpdateTransactionRequest
    {
        Id = existingTransaction.Id,
        MerchantName = "Updated Merchant"
    };
    
    // Act
    await _sut.UpdateTransaction(updateRequest);
    
    // Assert - reload to verify changes persisted
    var updated = await DbContext.Transactions.FindAsync(existingTransaction.Id);
    Assert.That(updated.MerchantName, Is.EqualTo("Updated Merchant"));
}
```

## Performance Considerations

- **Container startup**: Container starts once for all tests (~5-10 seconds)
- **Database creation**: Each test creates a fresh database using migrations (~100-500ms per test)
- **Test execution**: Integration tests are slower than pure unit tests, but provide higher confidence
- **Parallel execution**: Tests run in parallel by default, sharing the container

## Troubleshooting

### Container won't start
- Ensure Docker Desktop is running
- Check if port 5432 is already in use: `netstat -an | findstr 5432`
- Check Docker logs for PostgreSQL container errors

### Tests fail with connection errors
- Verify `[SetUpFixture]` is running (check test output)
- Ensure `TestContainerSetup.ConnectionString` is accessible
- Check Docker container is running: `docker ps`

### Tests are very slow
- Check Docker performance settings
- Reduce amount of seeded data
- Verify tests aren't running sequentially when they could run in parallel

### Lazy loading not working
- Ensure you're inheriting from `DatabaseIntegrationTestBase`
- Verify migrations are being applied (not `EnsureCreated`)
- Check that navigation properties are marked as `virtual`

## Adding New Tests

1. **Create a test class** inheriting from `DatabaseIntegrationTestBase`
2. **Override `CustomSetUp()`** to seed required data and setup dependencies
3. **Create test methods** following the naming convention
4. **Use the `DbContext` property** provided by the base class
5. **Mock external dependencies** using `MockFactory`
6. **Verify database state** in assertions

## Available Seed Methods

The `TestDatabaseSeedHelper` provides the following methods:

- `SeedTestUser()` - Create a test user
- `SeedTestPots()` - Create spending and savings pots
- `SeedTestTransactions()` - Create sample transactions
- `SeedTestSubscriptions()` - Create subscription data
- `SeedTestAutomaticTransactions()` - Create automatic transaction rules
- `SeedTestTasks()` - Create tasks and categories
- `SeedTestCalendarData()` - Create calendar events and types
- `SeedTestDocuments()` - Create documents and categories
- `SeedTestHistoricData()` - Create historic monthly data
- `SeedTestJournalEntries()` - Create journal entries
- `SeedTestMoodTrackerEntries()` - Create mood tracker entries
- `SeedTestNotes()` - Create notes and folders
- `SeedTestShoppingData()` - Create shopping list items
- `SeedMinimalData()` - Seed user + pots + minimal transactions
- `ClearAllData()` - Remove all data (rarely needed)

## Questions?

Refer to existing test files for examples:
- `TransactionsServiceIntegrationTests.cs` - Comprehensive service testing
- `PotsServiceIntegrationTests.cs` - CRUD operations
- `TasksServiceIntegrationTests.cs` - Testing with relationships
- `CurrencyExtensionsTests.cs` - Simple unit tests for extension methods
