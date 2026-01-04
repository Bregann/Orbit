using Microsoft.AspNetCore.Identity;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Tests.Infrastructure
{
    public class TestDatabaseSeedHelper
    {
        private static readonly PasswordHasher<User> _passwordHasher = new();

        public static async Task<User> SeedTestUser(AppDbContext context, string username = "testuser", string password = "test123!")
        {
            var user = new User
            {
                Username = username,
                FirstName = "Test",
                Email = $"{username}@test.com",
                PasswordHash = _passwordHasher.HashPassword(new User(), password)
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
            return user;
        }

        public static async Task SeedTestPots(AppDbContext context)
        {
            await context.SpendingPots.AddRangeAsync(new List<SpendingPot>
            {
                new SpendingPot
                {
                    PotName = "Test General",
                    AmountToAdd = 100,
                    PotAmountLeft = 50,
                    PotAmountSpent = 50,
                    RolloverDefaultChecked = true
                },
                new SpendingPot
                {
                    PotName = "Test Savings",
                    AmountToAdd = 200,
                    PotAmountLeft = 200,
                    PotAmountSpent = 0,
                    RolloverDefaultChecked = false
                }
            });

            await context.SavingsPots.AddRangeAsync(new List<SavingsPot>
            {
                new SavingsPot
                {
                    PotName = "Test Emergency Fund",
                    PotAmount = 5000,
                    AmountToAdd = 500
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestTransactions(AppDbContext context, int count = 5)
        {
            var transactions = new List<Transactions>();
            var baseDate = DateTime.UtcNow.Date;

            for (int i = 0; i < count; i++)
            {
                transactions.Add(new Transactions
                {
                    Id = $"test-txn-{i + 1:D4}",
                    TransactionAmount = (i + 1) * 1000,
                    MerchantName = $"Test Merchant {i + 1}",
                    TransactionDate = baseDate.AddDays(-i),
                    Processed = i % 2 == 0,
                    PotId = i % 2 == 0 ? 1 : null
                });
            }

            context.Transactions.AddRange(transactions);
            await context.SaveChangesAsync();
        }

        public static async Task SeedTestSubscriptions(AppDbContext context)
        {
            await context.Subscriptions.AddRangeAsync(new List<Subscription>
            {
                new Subscription
                {
                    SubscriptionName = "Test Netflix",
                    SubscriptionAmount = 1499,
                    BillingDay = 15,
                    SubscriptionMonthlyAmount = 1499,
                    BillingFrequency = Orbit.Domain.Enums.SubscriptionBillingFrequencyType.Monthly
                },
                new Subscription
                {
                    SubscriptionName = "Test Annual Service",
                    SubscriptionAmount = 12000,
                    BillingDay = 1,
                    BillingMonth = 1,
                    SubscriptionMonthlyAmount = 1000,
                    BillingFrequency = Orbit.Domain.Enums.SubscriptionBillingFrequencyType.Yearly
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestTasks(AppDbContext context)
        {
            await context.TaskCategories.AddRangeAsync(new List<TaskCategory>
            {
                new TaskCategory { Name = "Test Work" },
                new TaskCategory { Name = "Test Personal" }
            });

            await context.SaveChangesAsync();

            await context.Tasks.AddRangeAsync(new List<Domain.Database.Models.Task>
            {
                new Domain.Database.Models.Task
                {
                    Name = "Test Task 1",
                    Description = "Test Description 1",
                    Priority = Orbit.Domain.Enums.TaskPriorityType.High,
                    TaskCategoryId = 1,
                    DueDate = DateTime.UtcNow.AddDays(3),
                    CreatedAt = DateTime.UtcNow
                },
                new Domain.Database.Models.Task
                {
                    Name = "Test Task 2",
                    Description = "Test Description 2",
                    Priority = Orbit.Domain.Enums.TaskPriorityType.Medium,
                    TaskCategoryId = 2,
                    CompletedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestCalendarData(AppDbContext context)
        {
            await context.CalendarEventTypes.AddRangeAsync(new List<CalendarEventType>
            {
                new CalendarEventType
                {
                    EventTypeName = "Test Work",
                    HexColourCode = "#FF0000"
                },
                new CalendarEventType
                {
                    EventTypeName = "Test Personal",
                    HexColourCode = "#00FF00"
                }
            });

            await context.SaveChangesAsync();

            await context.CalendarEvents.AddRangeAsync(new List<CalendarEvent>
            {
                new CalendarEvent
                {
                    EventName = "Test Meeting",
                    EventLocation = "Test Location",
                    Description = "Test meeting description",
                    StartTime = DateTime.UtcNow.AddDays(1),
                    EndTime = DateTime.UtcNow.AddDays(1).AddHours(1),
                    IsAllDay = false,
                    CalendarEventTypeId = 1
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestDocuments(AppDbContext context)
        {
            await context.DocumentCategories.AddRangeAsync(new List<DocumentCategory>
            {
                new DocumentCategory { CategoryName = "Test Category 1" },
                new DocumentCategory { CategoryName = "Test Category 2" }
            });

            await context.SaveChangesAsync();

            await context.Documents.AddRangeAsync(new List<Document>
            {
                new Document
                {
                    DocumentName = "Test Document 1",
                    DocumentPath = "test/path/document1.pdf",
                    DocumentType = "application/pdf",
                    DocumentCategoryId = 1,
                    UploadedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Document
                {
                    DocumentName = "Test Document 2",
                    DocumentPath = "test/path/document2.pdf",
                    DocumentType = "application/pdf",
                    DocumentCategoryId = 2,
                    UploadedAt = DateTime.UtcNow.AddDays(-3)
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestHistoricData(AppDbContext context)
        {
            var historicMonth = new HistoricMonthlyData
            {
                StartDate = DateTime.UtcNow.AddMonths(-1),
                EndDate = DateTime.UtcNow.AddDays(-1),
                MonthlyIncome = 300000, // £3000
                AmountSpent = 150000, // £1500
                AmountSaved = 50000, // £500
                AmountLeftOver = 100000, // £1000
                SubscriptionCostAmount = 5000 // £50
            };

            await context.HistoricData.AddAsync(historicMonth);
            await context.SaveChangesAsync();

            // Add current month (no end date)
            var currentMonth = new HistoricMonthlyData
            {
                StartDate = DateTime.UtcNow.Date.AddDays(-DateTime.UtcNow.Day + 1),
                EndDate = null,
                MonthlyIncome = 300000,
                AmountSpent = 0,
                AmountSaved = 50000,
                AmountLeftOver = 0,
                SubscriptionCostAmount = 5000
            };

            await context.HistoricData.AddAsync(currentMonth);
            await context.SaveChangesAsync();
        }

        public static async Task SeedTestAutomaticTransactions(AppDbContext context)
        {
            await context.AutomaticTransactions.AddRangeAsync(new List<AutomaticTransaction>
            {
                new AutomaticTransaction
                {
                    MerchantName = "Netflix",
                    PotId = 1
                },
                new AutomaticTransaction
                {
                    MerchantName = "Spotify",
                    PotId = 1
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedMinimalData(AppDbContext context)
        {
            await SeedTestUser(context);
            await SeedTestPots(context);
            await SeedTestTransactions(context, 3);
        }

        public static async Task ClearAllData(AppDbContext context)
        {
            context.RemoveRange(context.Transactions);
            context.RemoveRange(context.HistoricSpendingPotData);
            context.RemoveRange(context.HistoricSavingsPotData);
            context.RemoveRange(context.HistoricData);
            context.RemoveRange(context.SpendingPots);
            context.RemoveRange(context.SavingsPots);
            context.RemoveRange(context.Subscriptions);
            context.RemoveRange(context.AutomaticTransactions);
            context.RemoveRange(context.Tasks);
            context.RemoveRange(context.TaskCategories);
            context.RemoveRange(context.CalendarEvents);
            context.RemoveRange(context.CalendarEventTypes);
            context.RemoveRange(context.CalendarEventExceptions);
            context.RemoveRange(context.Documents);
            context.RemoveRange(context.DocumentCategories);
            context.RemoveRange(context.ShoppingListItems);
            context.RemoveRange(context.ShoppingListQuickAddItems);
            context.RemoveRange(context.JournalEntries);
            context.RemoveRange(context.NotePages);
            context.RemoveRange(context.NoteFolders);
            context.RemoveRange(context.UserRefreshTokens);
            context.RemoveRange(context.Users);
            context.RemoveRange(context.EnvironmentalSettings);
            await context.SaveChangesAsync();
        }
    }
}
