using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Database.Models;

namespace Orbit.Domain.Database.Context
{
    public partial class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<EnvironmentalSetting> EnvironmentalSettings { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<UserRefreshToken> UserRefreshTokens { get; set; } = null!;

        public DbSet<Transactions> Transactions { get; set; } = null!;
        public DbSet<SpendingPot> SpendingPots { get; set; } = null!;
        public DbSet<SavingsPot> SavingsPots { get; set; } = null!;
        public DbSet<AutomaticTransaction> AutomaticTransactions { get; set; } = null!;
        public DbSet<HistoricMonthlyData> HistoricData { get; set; } = null!;
        public DbSet<HistoricSpendingPotData> HistoricSpendingPotData { get; set; } = null!;
        public DbSet<HistoricSavingsPotData> HistoricSavingsPotData { get; set; } = null!;
        public DbSet<Models.Task> Tasks { get; set; } = null!;
        public DbSet<TaskCategory> TaskCategories { get; set; } = null!;
    }
}
