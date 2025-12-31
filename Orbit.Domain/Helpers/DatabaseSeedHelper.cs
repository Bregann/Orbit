using Microsoft.AspNetCore.Identity;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.Interfaces.Helpers;
using Task = System.Threading.Tasks.Task;

namespace Orbit.Domain.Helpers
{
    public class DatabaseSeedHelper
    {
        private static readonly PasswordHasher<User> _passwordHasher = new();

        public static async Task SeedDatabase(AppDbContext context, IEnvironmentalSettingHelper settingsHelper, IServiceProvider serviceProvider)
        {
            // Generate the data
            var newUser = new User
            {
                Username = "testuser",
                FirstName = "test",
                Email = "test@test.com",
                PasswordHash = _passwordHasher.HashPassword(new User(), "test123!")
            };

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            await context.EnvironmentalSettings.AddAsync(new EnvironmentalSetting
            {
                Key = Enums.EnvironmentalSettingEnum.HangfireUsername.ToString(),
                Value = "admin"
            });

            await context.EnvironmentalSettings.AddAsync(new EnvironmentalSetting
            {
                Key = Enums.EnvironmentalSettingEnum.HangfirePassword.ToString(),
                Value = "password"
            });

            await context.EnvironmentalSettings.AddAsync(new EnvironmentalSetting
            {
                Key = Enums.EnvironmentalSettingEnum.FitbitClientId.ToString(),
                Value = "23TN9V"
            });

            await context.EnvironmentalSettings.AddAsync(new EnvironmentalSetting
            {
                Key = Enums.EnvironmentalSettingEnum.FitbitClientSecret.ToString(),
                Value = "30f8f50518fb867da5b78bc60dc00cd3"
            });

            await context.EnvironmentalSettings.AddAsync(new EnvironmentalSetting
            {
                Key = Enums.EnvironmentalSettingEnum.FitbitRedirectUri.ToString(),
                Value = "http://localhost:3000/fitbit-success"
            });

            await context.SaveChangesAsync();

            //            // Create spending and savings pots FIRST before historic data
            await context.SpendingPots.AddRangeAsync(new List<SpendingPot>
                        {
                            new SpendingPot
                            {
                                PotName = "General",
                                AmountToAdd = 200,
                                PotAmountLeft = 100,
                                PotAmountSpent = 900,
                                RolloverDefaultChecked = true
                            },
                            new SpendingPot
                            {
                                PotName = "Holiday",
                                AmountToAdd = 500,
                                PotAmountLeft = 1000,
                                PotAmountSpent = 4000,
                                RolloverDefaultChecked = false
                            },
                            new SpendingPot
                            {
                                PotName = "Emergency",
                                AmountToAdd = 300,
                                PotAmountLeft = 500,
                                PotAmountSpent = 1500,
                                RolloverDefaultChecked = true
                            }
                        });

            await context.SaveChangesAsync();

            await context.SavingsPots.AddRangeAsync(new List<SavingsPot>
                        {
                            new SavingsPot
                            {
                                PotName = "House Deposit",
                                PotAmount = 20000,
                                AmountToAdd = 1000
                            },
                            new SavingsPot
                            {
                                PotName = "Car Fund",
                                PotAmount = 10000,
                                AmountToAdd = 500
                            }
                        });

            await context.SaveChangesAsync();

            // Seed 12 months of historic data
            var historicMonths = new List<HistoricMonthlyData>();
            var random = new Random(42); // Fixed seed for consistent data

            for (int i = 11; i >= 0; i--)
            {
                var startDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var monthlyIncome = 2000m + (random.Next(-200, 300));
                var subscriptionCost = 300m;
                var amountSpent = 1200m + (random.Next(-300, 500));
                var amountSaved = 400m + (random.Next(-100, 200));
                var amountLeftOver = monthlyIncome - amountSpent - amountSaved - subscriptionCost;

                historicMonths.Add(new HistoricMonthlyData
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    MonthlyIncome = monthlyIncome,
                    AmountSpent = amountSpent,
                    AmountSaved = amountSaved,
                    AmountLeftOver = amountLeftOver,
                    SubscriptionCostAmount = subscriptionCost
                });
            }

            await context.HistoricData.AddRangeAsync(historicMonths);
            await context.SaveChangesAsync();

            // Add historic spending pot data for each month
            var historicSpendingPotData = new List<HistoricSpendingPotData>();
            var historicSavingsPotData = new List<HistoricSavingsPotData>();

            for (int monthIndex = 0; monthIndex < historicMonths.Count; monthIndex++)
            {
                var historicMonth = historicMonths[monthIndex];
                var monthId = monthIndex + 1;

                // General pot
                historicSpendingPotData.Add(new HistoricSpendingPotData
                {
                    PotId = 1,
                    HistoricMonthlyDataId = monthId,
                    PotAmount = 500m,
                    PotAmountSpent = 300m + (random.Next(-50, 100)),
                    PotAmountLeft = 200m
                });

                // Holiday pot
                historicSpendingPotData.Add(new HistoricSpendingPotData
                {
                    PotId = 2,
                    HistoricMonthlyDataId = monthId,
                    PotAmount = 800m,
                    PotAmountSpent = 400m + (random.Next(-100, 200)),
                    PotAmountLeft = 400m
                });

                // Emergency pot
                historicSpendingPotData.Add(new HistoricSpendingPotData
                {
                    PotId = 3,
                    HistoricMonthlyDataId = monthId,
                    PotAmount = 600m,
                    PotAmountSpent = 200m + (random.Next(-50, 150)),
                    PotAmountLeft = 400m
                });

                // House Deposit savings
                historicSavingsPotData.Add(new HistoricSavingsPotData
                {
                    PotId = 1,
                    HistoricMonthlyDataId = monthId,
                    PotAmount = 20000m + (monthIndex * 250m),
                    AmountSaved = 250m + (random.Next(-50, 100))
                });

                // Car Fund savings
                historicSavingsPotData.Add(new HistoricSavingsPotData
                {
                    PotId = 2,
                    HistoricMonthlyDataId = monthId,
                    PotAmount = 10000m + (monthIndex * 150m),
                    AmountSaved = 150m + (random.Next(-30, 80))
                });
            }

            await context.HistoricSpendingPotData.AddRangeAsync(historicSpendingPotData);
            await context.HistoricSavingsPotData.AddRangeAsync(historicSavingsPotData);
            await context.SaveChangesAsync();

            await context.Subscriptions.AddRangeAsync(new List<Subscription>
                        {
                            new Subscription
                            {
                                SubscriptionName = "Netflix",
                                SubscriptionAmount = 1599,
                                BillingDay = 15,
                                SubscriptionMonthlyAmount = 1599,
                                BillingFrequency = Enums.SubscriptionBillingFrequencyType.Monthly
                            },
                            new Subscription
                            {
                                SubscriptionName = "Spotify Premium",
                                SubscriptionAmount = 999,
                                BillingDay = 1,
                                SubscriptionMonthlyAmount = 999,
                                BillingFrequency = Enums.SubscriptionBillingFrequencyType.Monthly
                            },
                            new Subscription
                            {
                                SubscriptionName = "Amazon Prime",
                                SubscriptionAmount = 8999,
                                BillingDay = 10,
                                SubscriptionMonthlyAmount = 750,
                                BillingMonth = 10,
                                BillingFrequency = Enums.SubscriptionBillingFrequencyType.Yearly
                            },
                            new Subscription
                            {
                                SubscriptionName = "Gym Membership",
                                SubscriptionAmount = 2999,
                                BillingDay = 5,
                                SubscriptionMonthlyAmount = 2999,
                                BillingFrequency = Enums.SubscriptionBillingFrequencyType.Monthly
                            },
                            new Subscription
                            {
                                SubscriptionName = "Microsoft 365",
                                SubscriptionAmount = 5999,
                                BillingDay = 20,
                                SubscriptionMonthlyAmount = 500,
                                BillingMonth = 12,
                                BillingFrequency = Enums.SubscriptionBillingFrequencyType.Yearly
                            }
                        });

            await context.SaveChangesAsync();

            // Generate transactions for each historic month
            var transactions = new List<Transactions>();
            var merchants = new[] { "Tesco", "Sainsbury's", "Asda", "Amazon", "Apple", "Starbucks", "Costa Coffee",
                            "McDonald's", "Nando's", "Shell", "BP", "Zara", "H&M", "Nike", "John Lewis", "Currys",
                            "Argos", "Boots", "Superdrug", "Vue Cinema", "Odeon", "Spotify", "Netflix" };

            int transactionId = 1;

            for (int monthIndex = 0; monthIndex < historicMonths.Count; monthIndex++)
            {
                var historicMonth = historicMonths[monthIndex];
                var transactionsPerMonth = 15 + random.Next(5, 20);

                for (int t = 0; t < transactionsPerMonth; t++)
                {
                    var dayOffset = random.Next(0, (historicMonth.EndDate.Value - historicMonth.StartDate).Days + 1);
                    var transactionDate = historicMonth.StartDate.AddDays(dayOffset);
                    var merchantName = merchants[random.Next(merchants.Length)];
                    var amount = random.Next(500, 15000); // £5 to £150
                    var isPotAssigned = random.Next(0, 100) < 70; // 70% chance of being assigned to a pot

                    transactions.Add(new Transactions
                    {
                        Id = $"txn-{historicMonth.StartDate.Year}-{historicMonth.StartDate.Month:D2}-{transactionId:D4}",
                        TransactionAmount = amount,
                        MerchantName = merchantName,
                        TransactionDate = transactionDate,
                        Processed = true,
                        PotId = isPotAssigned ? random.Next(1, 4) : null
                    });

                    transactionId++;
                }
            }

            context.Transactions.AddRange(transactions);
            await context.SaveChangesAsync();

            await context.TaskCategories.AddRangeAsync(new List<TaskCategory>
                        {
                            new TaskCategory
                            {
                                Name = "Work"
                            },
                            new TaskCategory
                            {
                                Name = "Personal"
                            },
                            new TaskCategory
                            {
                                Name = "Shopping"
                            },
                            new TaskCategory
                            {
                                Name = "Misc"
                            }
                        });

            await context.SaveChangesAsync();

            await context.Tasks.AddRangeAsync(new List<Database.Models.Task>
                        {
                            new Database.Models.Task
                            {
                                Name = "Complete project report",
                                Description = "Finish the quarterly project report and submit to management",
                                Priority = Enums.TaskPriorityType.High,
                                TaskCategoryId = 1,
                                DueDate = DateTime.UtcNow.AddDays(3),
                                CreatedAt = DateTime.UtcNow
                            },
                            new Database.Models.Task
                            {
                                Name = "Team meeting preparation",
                                Description = "Prepare slides and agenda for next week's team meeting",
                                Priority = Enums.TaskPriorityType.Medium,
                                TaskCategoryId = 1,
                                DueDate = DateTime.UtcNow.AddDays(7),
                                CreatedAt = DateTime.UtcNow
                            },
                            new Database.Models.Task
                            {
                                Name = "Call dentist",
                                Description = "Schedule dental check up appointment",
                                Priority = Enums.TaskPriorityType.Low,
                                TaskCategoryId = 2,
                                DueDate = DateTime.UtcNow.AddDays(5),
                                CreatedAt = DateTime.UtcNow
                            },
                            new Database.Models.Task
                            {
                                Name = "Grocery shopping",
                                Description = "Buy milk, bread, eggs, and vegetables",
                                Priority = Enums.TaskPriorityType.Medium,
                                TaskCategoryId = 3,
                                DueDate = DateTime.UtcNow.AddDays(1),
                                CreatedAt = DateTime.UtcNow
                            },
                            new Database.Models.Task
                            {
                                Name = "Review budget",
                                Description = "Go through monthly expenses and update budget spreadsheet",
                                Priority = Enums.TaskPriorityType.High,
                                TaskCategoryId = 2,
                                CompletedAt = DateTime.UtcNow.AddDays(-2),
                                CreatedAt = DateTime.UtcNow.AddDays(-5)
                            },
                            new Database.Models.Task
                            {
                                Name = "Random task",
                                Description = "This is an uncategorised task that needs to be sorted later",
                                Priority = Enums.TaskPriorityType.Low,
                                TaskCategoryId = 4,
                                CreatedAt = DateTime.UtcNow
                            }
                        });

            await context.SaveChangesAsync();

            await context.CalendarEventTypes.AddRangeAsync(new List<CalendarEventType>
                        {
                            new CalendarEventType
                            {
                                EventTypeName = "Work",
                                HexColourCode = "#3B82F6"
                            },
                            new CalendarEventType
                            {
                                EventTypeName = "Personal",
                                HexColourCode = "#10B981"
                            },
                            new CalendarEventType
                            {
                                EventTypeName = "Meeting",
                                HexColourCode = "#F59E0B"
                            },
                            new CalendarEventType
                            {
                                EventTypeName = "Appointment",
                                HexColourCode = "#EF4444"
                            },
                            new CalendarEventType
                            {
                                EventTypeName = "Social",
                                HexColourCode = "#8B5CF6"
                            }
                        });

            await context.SaveChangesAsync();

            await context.CalendarEvents.AddRangeAsync(new List<CalendarEvent>
                        {
                            new CalendarEvent
                            {
                                EventName = "Team Standup",
                                EventLocation = "Office - Conference Room A",
                                Description = "Daily team standup meeting to discuss progress and blockers",
                                StartTime = DateTime.UtcNow.AddDays(1).Date.AddHours(9),
                                EndTime = DateTime.UtcNow.AddDays(1).Date.AddHours(9).AddMinutes(30),
                                IsAllDay = false,
                                CalendarEventTypeId = 3,
                                RecurrenceRule = "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR"
                            },
                            new CalendarEvent
                            {
                                EventName = "Project Deadline",
                                EventLocation = "Remote",
                                Description = "Final deadline for Q4 project deliverables",
                                StartTime = DateTime.UtcNow.AddDays(5).Date,
                                EndTime = DateTime.UtcNow.AddDays(5).Date.AddHours(23).AddMinutes(59),
                                IsAllDay = true,
                                CalendarEventTypeId = 1
                            },
                            new CalendarEvent
                            {
                                EventName = "Dentist Appointment",
                                EventLocation = "City Dental Clinic",
                                Description = "Regular dental checkup and cleaning",
                                StartTime = DateTime.UtcNow.AddDays(3).Date.AddHours(14),
                                EndTime = DateTime.UtcNow.AddDays(3).Date.AddHours(15),
                                IsAllDay = false,
                                CalendarEventTypeId = 4
                            },
                            new CalendarEvent
                            {
                                EventName = "Lunch with Sarah",
                                EventLocation = "Italian Restaurant",
                                Description = "Catch up with Sarah over lunch",
                                StartTime = DateTime.UtcNow.AddDays(2).Date.AddHours(12).AddMinutes(30),
                                EndTime = DateTime.UtcNow.AddDays(2).Date.AddHours(14),
                                IsAllDay = false,
                                CalendarEventTypeId = 5
                            },
                            new CalendarEvent
                            {
                                EventName = "Gym Session",
                                EventLocation = "Local Fitness Center",
                                Description = "Evening workout session",
                                StartTime = DateTime.UtcNow.Date.AddHours(18),
                                EndTime = DateTime.UtcNow.Date.AddHours(19).AddMinutes(30),
                                IsAllDay = false,
                                CalendarEventTypeId = 2,
                                RecurrenceRule = "FREQ=WEEKLY;BYDAY=MO,WE,FR"
                            },
                            new CalendarEvent
                            {
                                EventName = "Client Presentation",
                                EventLocation = "Client Office - Downtown",
                                Description = "Present Q4 results and roadmap to client stakeholders",
                                StartTime = DateTime.UtcNow.AddDays(7).Date.AddHours(10),
                                EndTime = DateTime.UtcNow.AddDays(7).Date.AddHours(12),
                                IsAllDay = false,
                                CalendarEventTypeId = 3
                            },
                            new CalendarEvent
                            {
                                EventName = "Birthday Party",
                                EventLocation = "Mike's House",
                                Description = "Mike's 30th birthday celebration",
                                StartTime = DateTime.UtcNow.AddDays(10).Date.AddHours(19),
                                EndTime = DateTime.UtcNow.AddDays(10).Date.AddHours(23),
                                IsAllDay = false,
                                CalendarEventTypeId = 5
                            }
                        });

            await context.SaveChangesAsync();

            await context.DocumentCategories.AddRangeAsync(new List<DocumentCategory>
                        {
                            new DocumentCategory
                            {
                                CategoryName = "Financial"
                            },
                            new DocumentCategory
                            {
                                CategoryName = "Personal"
                            },
                            new DocumentCategory
                            {
                                CategoryName = "Legal"
                            },
                            new DocumentCategory
                            {
                                CategoryName = "Medical"
                            }
                        });

            await context.SaveChangesAsync();

            // Create test files in DocumentsStorage directory
            var currentPath = Directory.GetCurrentDirectory();
            var documentStoragePath = Path.Combine(currentPath, "DocumentsStorage");

            if (!Directory.Exists(documentStoragePath))
            {
                Directory.CreateDirectory(documentStoragePath);
            }

            // Create test text file
            var textFilePath = Path.Combine(documentStoragePath, "sample-invoice.txt");
            if (!File.Exists(textFilePath))
            {
                var textContent = @"INVOICE
            ================

            Invoice Number: INV-2024-001
            Date: 2024-01-15
            Due Date: 2024-02-15

            Bill To:
            Test User
            test@test.com

            Description: Monthly Service
            Amount: £1,500.00
            VAT (20%): £300.00

            Total Due: £1,800.00

            Thank you for your business!";
                await File.WriteAllTextAsync(textFilePath, textContent);
            }

            // Create sample PDF metadata file
            var pdfFilePath = Path.Combine(documentStoragePath, "financial-report.txt");
            if (!File.Exists(pdfFilePath))
            {
                var pdfContent = @"FINANCIAL REPORT Q4 2024
            ==========================

            Executive Summary:
            This financial report provides a comprehensive overview of the company's financial performance for Q4 2024.

            Key Metrics:
            - Total Revenue: £250,000
            - Operating Expenses: £180,000
            - Net Profit: £70,000
            - Profit Margin: 28%

            Revenue Breakdown:
            - Product Sales: £150,000 (60%)
            - Services: £100,000 (40%)

            Expense Breakdown:
            - Salaries: £120,000 (67%)
            - Operational Costs: £50,000 (28%)
            - Miscellaneous: £10,000 (5%)

            Recommendations:
            1. Increase marketing spend for Q1 2025
            2. Optimize operational costs
            3. Focus on service revenue growth

            Report Generated: 2024-12-31";
                await File.WriteAllTextAsync(pdfFilePath, pdfContent);
            }

            // Create sample medical document file
            var medicalFilePath = Path.Combine(documentStoragePath, "medical-record.txt");
            if (!File.Exists(medicalFilePath))
            {
                var medicalContent = @"MEDICAL RECORD
            ===============

            Patient Name: Test User
            Date of Birth: 1990-05-15
            Patient ID: MED-001

            Last Visit: 2024-01-10
            Next Appointment: 2024-02-10

            Medical History:
            - No major allergies reported
            - Blood Type: O+
            - Current Medications: None

            Last Checkup Results:
            - Blood Pressure: 120/80 mmHg (Normal)
            - Heart Rate: 72 bpm (Normal)
            - Temperature: 98.6°F (Normal)
            - Weight: 75 kg
            - Height: 180 cm

            Notes:
            Patient in good health. Continue current lifestyle.
            Schedule annual checkup for next year.";
                await File.WriteAllTextAsync(medicalFilePath, medicalContent);
            }

            // Create sample legal document file
            var legalFilePath = Path.Combine(documentStoragePath, "contract-agreement.txt");
            if (!File.Exists(legalFilePath))
            {
                var legalContent = @"SERVICE AGREEMENT
            ==================

            This Service Agreement ('Agreement') is entered into as of January 1, 2024

            Between:
            Service Provider: Orbit Services Ltd
            Client: Test User

            1. SERVICES
            The Service Provider agrees to provide professional services as outlined in this agreement.

            2. PAYMENT TERMS
            - Monthly Fee: £1,500
            - Payment Due: 15th of each month
            - Late Payment: 2% interest per month

            3. TERM
            This agreement commences on January 1, 2024 and continues for 12 months.

            4. TERMINATION
            Either party may terminate with 30 days written notice.

            5. CONFIDENTIALITY
            Both parties agree to maintain confidentiality of proprietary information.

            Signed:
            Date: 2024-01-01";
                await File.WriteAllTextAsync(legalFilePath, legalContent);
            }

            // Seed documents
            await context.Documents.AddRangeAsync(new List<Document>
                        {
                            new Document
                            {
                                DocumentName = "sample-invoice.txt",
                                DocumentPath = Path.Combine("DocumentsStorage", "sample-invoice.txt"),
                                DocumentType = "text/plain",
                                DocumentCategoryId = 1,
                                UploadedAt = DateTime.UtcNow.AddDays(-30)
                            },
                            new Document
                            {
                                DocumentName = "financial-report.txt",
                                DocumentPath = Path.Combine("DocumentsStorage", "financial-report.txt"),
                                DocumentType = "text/plain",
                                DocumentCategoryId = 1,
                                UploadedAt = DateTime.UtcNow.AddDays(-20)
                            },
                            new Document
                            {
                                DocumentName = "medical-record.txt",
                                DocumentPath = Path.Combine("DocumentsStorage", "medical-record.txt"),
                                DocumentType = "text/plain",
                                DocumentCategoryId = 4,
                                UploadedAt = DateTime.UtcNow.AddDays(-15)
                            },
                            new Document
                            {
                                DocumentName = "contract-agreement.txt",
                                DocumentPath = Path.Combine("DocumentsStorage", "contract-agreement.txt"),
                                DocumentType = "text/plain",
                                DocumentCategoryId = 3,
                                UploadedAt = DateTime.UtcNow.AddDays(-10)
                            }
                        });

            await context.SaveChangesAsync();

            await context.ShoppingListItems.AddRangeAsync(new List<ShoppingListItem>
                        {
                            new ShoppingListItem
                            {
                                Name = "Milk",
                                AddedAt = DateTime.UtcNow.AddDays(-5),
                                IsPurchased = false
                            },
                            new ShoppingListItem
                            {
                                Name = "Bread",
                                AddedAt = DateTime.UtcNow.AddDays(-4),
                                IsPurchased = false
                            },
                            new ShoppingListItem
                            {
                                Name = "Eggs",
                                AddedAt = DateTime.UtcNow.AddDays(-3),
                                IsPurchased = true
                            },
                            new ShoppingListItem
                            {
                                Name = "Chicken Breast",
                                AddedAt = DateTime.UtcNow.AddDays(-2),
                                IsPurchased = false
                            },
                            new ShoppingListItem
                            {
                                Name = "Pasta",
                                AddedAt = DateTime.UtcNow.AddDays(-1),
                                IsPurchased = false
                            },
                            new ShoppingListItem
                            {
                                Name = "Tomato Sauce",
                                AddedAt = DateTime.UtcNow,
                                IsPurchased = true
                            },
                            new ShoppingListItem
                            {
                                Name = "Cheese",
                                AddedAt = DateTime.UtcNow,
                                IsPurchased = false
                            },
                            new ShoppingListItem
                            {
                                Name = "Apples",
                                AddedAt = DateTime.UtcNow.AddHours(-2),
                                IsPurchased = false
                            }
                        });

            await context.SaveChangesAsync();

            await context.ShoppingListQuickAddItems.AddRangeAsync(new List<ShoppingListQuickAddItem>
                        {
                            new ShoppingListQuickAddItem
                            {
                                Name = "Milk"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Bread"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Eggs"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Butter"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Pasta"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Rice"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Chicken"
                            },
                            new ShoppingListQuickAddItem
                            {
                                Name = "Bananas"
                            }
                        });

            await context.SaveChangesAsync();

            await context.JournalEntries.AddRangeAsync(new List<JournalEntry>
                        {
                            new JournalEntry
                            {
                                Title = "First day of the new year",
                                Content = "Today marks the beginning of a new chapter in my life. I'm feeling optimistic about the opportunities ahead and excited to start working on my personal goals. The weather is beautiful, and I took a long walk to clear my mind.",
                                CreatedAt = DateTime.UtcNow.AddDays(-10),
                                Mood = Enums.JournalMoodEnum.Good
                            },
                            new JournalEntry
                            {
                                Title = "Productive work day",
                                Content = "Had a really productive day at work. Managed to complete the main tasks on my list and even had time to help a colleague with their project. Feeling accomplished and energized.",
                                CreatedAt = DateTime.UtcNow.AddDays(-8),
                                Mood = Enums.JournalMoodEnum.Good
                            },
                            new JournalEntry
                            {
                                Title = "Rainy afternoon reflections",
                                Content = "The rain outside matches my mood today. Been thinking about some life decisions and what I really want to achieve. It's one of those days where everything feels uncertain, but I know this feeling will pass.",
                                CreatedAt = DateTime.UtcNow.AddDays(-5),
                                Mood = Enums.JournalMoodEnum.Bad
                            },
                            new JournalEntry
                            {
                                Title = "Gym session success",
                                Content = "Finally got back into my fitness routine! Completed a great workout at the gym today and felt energized afterwards. Small wins like this help build confidence and momentum.",
                                CreatedAt = DateTime.UtcNow.AddDays(-3),
                                Mood = Enums.JournalMoodEnum.Great
                            },
                            new JournalEntry
                            {
                                Title = "Mixed feelings",
                                Content = "Today was a bit chaotic. Had some great moments but also faced a few unexpected challenges. Overall, it balanced out. Trying to maintain perspective and focus on what I can control.",
                                CreatedAt = DateTime.UtcNow.AddDays(-1),
                                Mood = Enums.JournalMoodEnum.Neutral
                            },
                            new JournalEntry
                            {
                                Title = "Grateful for the small things",
                                Content = "Spent the evening with friends and it reminded me how important these connections are. We laughed, shared stories, and just enjoyed each other's company. Feeling thankful for the people in my life.",
                                CreatedAt = DateTime.UtcNow,
                                Mood = Enums.JournalMoodEnum.Awful
                            },
                            new JournalEntry
                            {
                                Title = "Anxious about upcoming presentation",
                                Content = "Can't shake this nervous feeling about the presentation next week. Keep rehearsing in my head and imagining different scenarios. Need to remember that preparation is key and I've done this before successfully.",
                                CreatedAt = DateTime.UtcNow.AddHours(-6),
                                Mood = Enums.JournalMoodEnum.Awful
                            }
                        });

            await context.SaveChangesAsync();

            await context.NoteFolders.AddRangeAsync(new List<NoteFolder>
                        {
                            new NoteFolder
                            {
                                FolderName = "Work",
                                FolderIcon = "💼"
                            },
                            new NoteFolder
                            {
                                FolderName = "Personal",
                                FolderIcon = "❤️"
                            },
                            new NoteFolder
                            {
                                FolderName = "Ideas",
                                FolderIcon = "💡"
                            },
                            new NoteFolder
                            {
                                FolderName = "Learning",
                                FolderIcon = "📖"
                            }
                        });

            await context.SaveChangesAsync();

            await context.NotePages.AddRangeAsync(new List<NotePage>
                        {
                            new NotePage
                            {
                                Title = "Project Requirements",
                                Content = "Gather and document all project requirements from stakeholders. Need to schedule meetings with the design and development teams to align on scope and timeline.",
                                CreatedAt = DateTime.UtcNow.AddDays(-14),
                                IsFavourite = true,
                                FolderId = 1
                            },
                            new NotePage
                            {
                                Title = "Meeting Notes - Q1 Planning",
                                Content = "Discussed Q1 roadmap with the team. Key points:\n- Focus on performance optimization\n- User feedback implementation\n- Bug fixes and technical debt\n\nAction items assigned to team members.",
                                CreatedAt = DateTime.UtcNow.AddDays(-10),
                                IsFavourite = false,
                                FolderId = 1
                            },
                            new NotePage
                            {
                                Title = "Code Review Checklist",
                                Content = "1. Check for code style consistency\n2. Verify test coverage\n3. Look for potential performance issues\n4. Check security implications\n5. Ensure documentation is updated\n6. Verify no breaking changes",
                                CreatedAt = DateTime.UtcNow.AddDays(-7),
                                IsFavourite = true,
                                FolderId = 1
                            },
                            new NotePage
                            {
                                Title = "Fitness Goals 2024",
                                Content = "Goals for this year:\n- Run a 10K by June\n- Reach gym 3x per week consistently\n- Improve flexibility through yoga\n- Track nutrition weekly\n\nStarting measurements recorded on January 1st.",
                                CreatedAt = DateTime.UtcNow.AddDays(-9),
                                IsFavourite = false,
                                FolderId = 2
                            },
                            new NotePage
                            {
                                Title = "Travel Bucket List",
                                Content = "Places to visit:\n- Japan (spring 2025)\n- Norway - Northern Lights\n- Bali, Indonesia\n- Iceland\n- New Zealand\n- Peru - Machu Picchu\n\nNeed to save and plan budget.",
                                CreatedAt = DateTime.UtcNow.AddDays(-5),
                                IsFavourite = true,
                                FolderId = 2
                            },
                            new NotePage
                            {
                                Title = "Book Recommendations",
                                Content = "Books to read:\n- 'Atomic Habits' by James Clear\n- 'The Midnight Library' by Matt Haig\n- 'Project Hail Mary' by Andy Weir\n- 'Educated' by Tara Westover\n- '1984' by George Orwell\n\nStarted: Atomic Habits",
                                CreatedAt = DateTime.UtcNow.AddDays(-3),
                                IsFavourite = false,
                                FolderId = 2
                            },
                            new NotePage
                            {
                                Title = "App Feature Ideas",
                                Content = "Ideas for future app enhancements:\n- Dark mode implementation\n- Offline support\n- Real-time collaboration\n- Advanced search with filters\n- Export to PDF/CSV\n- Mobile app native version\n\nNeed to prioritize and estimate effort.",
                                CreatedAt = DateTime.UtcNow.AddDays(-6),
                                IsFavourite = true,
                                FolderId = 3
                            },
                            new NotePage
                            {
                                Title = "Brainstorm: New Side Project",
                                Content = "Considering building a tool for:\n- Personal finance management\n- Time tracking\n- Habit formation\n- Community features\n\nTech stack options: .NET, React, PostgreSQL vs Node.js, Vue, MongoDB",
                                CreatedAt = DateTime.UtcNow.AddDays(-4),
                                IsFavourite = false,
                                FolderId = 3
                            },
                            new NotePage
                            {
                                Title = "C# Advanced Topics",
                                Content = "Topics to deep dive into:\n- LINQ performance optimization\n- Entity Framework advanced patterns\n- Async/await patterns\n- Dependency injection best practices\n- Middleware and filters\n- Background jobs and scheduling\n\nResources: Microsoft docs, blog posts, conference talks",
                                CreatedAt = DateTime.UtcNow.AddDays(-2),
                                IsFavourite = true,
                                FolderId = 4
                            },
                            new NotePage
                            {
                                Title = "Database Design Patterns",
                                Content = "Study repository pattern, unit of work pattern, and data access layers. Compare ORM vs raw SQL approaches. Document findings and best practices for team.",
                                CreatedAt = DateTime.UtcNow,
                                IsFavourite = false,
                                FolderId = 4
                            }
                        });

            await context.SaveChangesAsync();
        }
    }
}
