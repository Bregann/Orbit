using Microsoft.AspNetCore.Identity;
using Orbit.Domain.Database.Context;
using Orbit.Domain.Database.Models;
using Orbit.Domain.Interfaces.Helpers;

namespace Orbit.Domain.Helpers
{
    public class DatabaseSeedHelper
    {
        private static readonly PasswordHasher<User> _passwordHasher = new();

        public static async System.Threading.Tasks.Task SeedDatabase(AppDbContext context, IEnvironmentalSettingHelper settingsHelper, IServiceProvider serviceProvider)
        {
            // Generate the data

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

            await context.SaveChangesAsync();

            await context.HistoricData.AddRangeAsync(new List<HistoricMonthlyData>
            {
                new HistoricMonthlyData
                {
                    AmountSaved = 500,
                    AmountSpent = 1500,
                    SubscriptionCostAmount = 300,
                    DateAdded = DateTime.UtcNow.AddDays(-11),
                    MonthlyIncome = 2000,
                },
                new HistoricMonthlyData
                {
                    AmountSaved = 600,
                    AmountSpent = 1400,
                    SubscriptionCostAmount = 300,
                    DateAdded = DateTime.UtcNow.AddMonths(-1),
                    MonthlyIncome = 2000,
                },
            });

            await context.SaveChangesAsync();

            await context.SpendingPots.AddRangeAsync(new List<SpendingPot>
            {
                new SpendingPot
                {
                    PotName = "General",
                    AmountToAdd = 200,
                    PotAmountLeft = 100,
                    PotAmountSpent = 900
                },
                new SpendingPot
                {
                    PotName = "Holiday",
                    AmountToAdd = 500,
                    PotAmountLeft = 1000,
                    PotAmountSpent = 4000
                },
                new SpendingPot
                {
                    PotName = "Emergency",
                    AmountToAdd = 300,
                    PotAmountLeft = 500,
                    PotAmountSpent = 1500
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

            var newUser = new User
            {
                Username = "testuser",
                FirstName = "test",
                Email = "test@test.com",
                PasswordHash = _passwordHasher.HashPassword(new User(), "test123!")
            };

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            context.Transactions.AddRange(new List<Transactions>
            {
                new Transactions
                {
                    TransactionAmount = 1000,
                    Id = "example-transaction-1",
                    MerchantName = "Tesco",
                    Processed = false,
                    TransactionDate = DateTime.UtcNow.AddDays(-10),
                },
                new Transactions
                {
                    TransactionAmount = 500,
                    Id = "example-transaction-2",
                    MerchantName = "Amazon",
                    Processed = false,
                    TransactionDate = DateTime.UtcNow.AddDays(-5),
                },
                new Transactions
                {
                    TransactionAmount = 200,
                    Id = "example-transaction-3",
                    MerchantName = "Starbucks",
                    Processed = false,
                    TransactionDate = DateTime.UtcNow.AddDays(-2),
                },
                new Transactions
                {
                    TransactionAmount = 1500,
                    Id = "example-transaction-4",
                    MerchantName = "Apple",
                    Processed = true,
                    PotId = 1,
                    TransactionDate = DateTime.UtcNow.AddDays(-1),
                }
            });

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
        }
    }
}
