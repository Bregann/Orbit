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
        public DbSet<Subscription> Subscriptions { get; set; } = null!;
        public DbSet<AutomaticTransaction> AutomaticTransactions { get; set; } = null!;
        public DbSet<HistoricMonthlyData> HistoricData { get; set; } = null!;
        public DbSet<HistoricSpendingPotData> HistoricSpendingPotData { get; set; } = null!;
        public DbSet<HistoricSavingsPotData> HistoricSavingsPotData { get; set; } = null!;

        public DbSet<Models.Task> Tasks { get; set; } = null!;
        public DbSet<TaskCategory> TaskCategories { get; set; } = null!;

        public DbSet<CalendarEvent> CalendarEvents { get; set; } = null!;
        public DbSet<CalendarEventType> CalendarEventTypes { get; set; } = null!;
        public DbSet<CalendarEventException> CalendarEventExceptions { get; set; } = null!;

        public DbSet<Document> Documents { get; set; } = null!;
        public DbSet<DocumentCategory> DocumentCategories { get; set; } = null!;

        public DbSet<ShoppingListItem> ShoppingListItems { get; set; } = null!;
        public DbSet<ShoppingListQuickAddItem> ShoppingListQuickAddItems { get; set; } = null!;

        public DbSet<JournalEntry> JournalEntries { get; set; } = null!;

        public DbSet<NoteFolder> NoteFolders { get; set; } = null!;
        public DbSet<NotePage> NotePages { get; set; } = null!;

        public DbSet<MoodTrackerEntry> MoodTrackerEntries { get; set; } = null!;
    }
}
