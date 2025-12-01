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
            // blah blah blah

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
                    DateAdded = DateTime.UtcNow.AddDays(-11),
                    MonthlyIncome = 2000,
                },
                new HistoricMonthlyData
                {
                    AmountSaved = 600,
                    AmountSpent = 1400,
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
        }
    }
}
