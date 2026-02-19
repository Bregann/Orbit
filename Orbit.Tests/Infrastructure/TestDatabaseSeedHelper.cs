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
                },
                new SpendingPot
                {
                    PotName = "Test Entertainment",
                    AmountToAdd = 150,
                    PotAmountLeft = 100,
                    PotAmountSpent = 50,
                    RolloverDefaultChecked = true
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

        public static async Task SeedTestAssets(AppDbContext context)
        {
            await context.AssetCategories.AddRangeAsync(new List<AssetCategory>
            {
                new AssetCategory { CategoryName = "Test Electronics" },
                new AssetCategory { CategoryName = "Test Furniture" }
            });

            await context.SaveChangesAsync();

            await context.Assets.AddRangeAsync(new List<Asset>
            {
                new Asset
                {
                    AssetName = "Test Laptop",
                    Brand = "Test Brand",
                    Model = "Test Model X",
                    SerialNumber = "SN123456",
                    PurchaseDate = DateTime.UtcNow.AddMonths(-6),
                    PurchasePrice = 1200.00m,
                    Location = "Test Office",
                    WarrantyExpirationDate = DateTime.UtcNow.AddMonths(18),
                    Notes = "Test laptop for development",
                    Status = "Active",
                    AssetCategoryId = 1,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    LastUpdatedAt = DateTime.UtcNow.AddMonths(-6)
                },
                new Asset
                {
                    AssetName = "Test Monitor",
                    Brand = "Test Display Co",
                    Model = "Monitor Pro",
                    SerialNumber = "MON789012",
                    PurchaseDate = DateTime.UtcNow.AddYears(-1),
                    PurchasePrice = 450.00m,
                    Location = "Test Office",
                    WarrantyExpirationDate = DateTime.UtcNow.AddMonths(-6),
                    Notes = "27 inch display",
                    Status = "Active",
                    AssetCategoryId = 1,
                    CreatedAt = DateTime.UtcNow.AddYears(-1),
                    LastUpdatedAt = DateTime.UtcNow.AddYears(-1)
                },
                new Asset
                {
                    AssetName = "Test Desk",
                    Brand = "Test Furniture Inc",
                    Model = "Standing Desk Pro",
                    SerialNumber = "DESK345678",
                    PurchaseDate = DateTime.UtcNow.AddYears(-2),
                    PurchasePrice = 800.00m,
                    Location = "Test Office",
                    Notes = "Height adjustable desk",
                    Status = "Active",
                    AssetCategoryId = 2,
                    CreatedAt = DateTime.UtcNow.AddYears(-2),
                    LastUpdatedAt = DateTime.UtcNow.AddYears(-2)
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
                MonthlyIncome = 300000, // �3000
                AmountSpent = 150000, // �1500
                AmountSaved = 50000, // �500
                AmountLeftOver = 100000, // �1000
                SubscriptionCostAmount = 5000 // �50
            };

            await context.HistoricData.AddAsync(historicMonth);
            await context.SaveChangesAsync();

            // Add historic spending pot data for the completed month
            await context.HistoricSpendingPotData.AddRangeAsync(new List<HistoricSpendingPotData>
            {
                new HistoricSpendingPotData
                {
                    PotId = 1,
                    HistoricMonthlyDataId = historicMonth.Id,
                    PotAmount = 100m,
                    PotAmountSpent = 50m,
                    PotAmountLeft = 50m
                },
                new HistoricSpendingPotData
                {
                    PotId = 2,
                    HistoricMonthlyDataId = historicMonth.Id,
                    PotAmount = 200m,
                    PotAmountSpent = 100m,
                    PotAmountLeft = 100m
                }
            });

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

        public static async Task SeedTestJournalEntries(AppDbContext context)
        {
            await context.JournalEntries.AddRangeAsync(new List<JournalEntry>
            {
                new JournalEntry
                {
                    Title = "Test Entry 1",
                    Content = "This is a test journal entry content",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    Mood = Orbit.Domain.Enums.JournalMoodEnum.Good
                },
                new JournalEntry
                {
                    Title = "Test Entry 2",
                    Content = "Another test journal entry",
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    Mood = Orbit.Domain.Enums.JournalMoodEnum.Great
                },
                new JournalEntry
                {
                    Title = "Test Entry 3",
                    Content = "A neutral mood entry",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    Mood = Orbit.Domain.Enums.JournalMoodEnum.Neutral
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestMoodTrackerEntries(AppDbContext context)
        {
            await context.MoodTrackerEntries.AddRangeAsync(new List<MoodTrackerEntry>
            {
                new MoodTrackerEntry
                {
                    MoodType = Orbit.Domain.Enums.MoodTrackerEnum.Good,
                    DateRecorded = DateTime.UtcNow.AddDays(-5)
                },
                new MoodTrackerEntry
                {
                    MoodType = Orbit.Domain.Enums.MoodTrackerEnum.Excellent,
                    DateRecorded = DateTime.UtcNow.AddDays(-4)
                },
                new MoodTrackerEntry
                {
                    MoodType = Orbit.Domain.Enums.MoodTrackerEnum.Neutral,
                    DateRecorded = DateTime.UtcNow.AddDays(-3)
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestMoodTrackerEntry(AppDbContext context, Domain.Enums.MoodTrackerEnum mood, DateTime date)
        {
            await context.MoodTrackerEntries.AddAsync(new MoodTrackerEntry
            {
                MoodType = mood,
                DateRecorded = DateTime.SpecifyKind(date, DateTimeKind.Utc)
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestMoodTrackerEntriesForYear(AppDbContext context, int year, int count = 12)
        {
            var entries = new List<MoodTrackerEntry>();
            var moods = new[] {
                Orbit.Domain.Enums.MoodTrackerEnum.Excellent,
                Orbit.Domain.Enums.MoodTrackerEnum.Good,
                Orbit.Domain.Enums.MoodTrackerEnum.Neutral,
                Orbit.Domain.Enums.MoodTrackerEnum.Low,
                Orbit.Domain.Enums.MoodTrackerEnum.Difficult
            };

            for (int i = 0; i < count; i++)
            {
                var month = (i % 12) + 1;
                var day = 15; // Middle of the month
                var mood = moods[i % moods.Length];

                entries.Add(new MoodTrackerEntry
                {
                    MoodType = mood,
                    DateRecorded = new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc)
                });
            }

            await context.MoodTrackerEntries.AddRangeAsync(entries);
            await context.SaveChangesAsync();
        }

        public static async Task SeedTestMoodTrackerEntriesForMultipleYears(AppDbContext context, params int[] years)
        {
            foreach (var year in years)
            {
                await SeedTestMoodTrackerEntriesForYear(context, year, 3); // 3 entries per year
            }
        }

        public static async Task SeedTestNotes(AppDbContext context)
        {
            await context.NoteFolders.AddRangeAsync(new List<NoteFolder>
            {
                new NoteFolder
                {
                    FolderName = "Test Work",
                    FolderIcon = "??"
                },
                new NoteFolder
                {
                    FolderName = "Test Personal",
                    FolderIcon = "??"
                }
            });

            await context.SaveChangesAsync();

            await context.NotePages.AddRangeAsync(new List<NotePage>
            {
                new NotePage
                {
                    Title = "Test Note 1",
                    Content = "<p>This is test note 1 content</p>",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    IsFavourite = true,
                    FolderId = 1
                },
                new NotePage
                {
                    Title = "Test Note 2",
                    Content = "<p>This is test note 2 content</p>",
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    IsFavourite = false,
                    FolderId = 1
                },
                new NotePage
                {
                    Title = "Test Note 3",
                    Content = "<p>This is test note 3 content</p>",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    IsFavourite = false,
                    FolderId = null
                }
            });

            await context.SaveChangesAsync();
        }

        public static async Task SeedTestShoppingData(AppDbContext context)
        {
            await context.ShoppingListItems.AddRangeAsync(new List<ShoppingListItem>
            {
                new ShoppingListItem
                {
                    Name = "Milk",
                    AddedAt = DateTime.UtcNow.AddDays(-2),
                    IsPurchased = false
                },
                new ShoppingListItem
                {
                    Name = "Bread",
                    AddedAt = DateTime.UtcNow.AddDays(-1),
                    IsPurchased = false
                },
                new ShoppingListItem
                {
                    Name = "Eggs",
                    AddedAt = DateTime.UtcNow.AddHours(-6),
                    IsPurchased = true
                },
                new ShoppingListItem
                {
                    Name = "Butter",
                    AddedAt = DateTime.UtcNow.AddHours(-3),
                    IsPurchased = true
                }
            });

            await context.ShoppingListQuickAddItems.AddRangeAsync(new List<ShoppingListQuickAddItem>
            {
                new ShoppingListQuickAddItem { Name = "Milk" },
                new ShoppingListQuickAddItem { Name = "Bread" },
                new ShoppingListQuickAddItem { Name = "Eggs" }
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
            context.RemoveRange(context.Assets);
            context.RemoveRange(context.AssetCategories);
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
