using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Domain.Database.Context
{
    public class SqliteContext(DbContextOptions<SqliteContext> options) : AppDbContext(options)
    {
    }
}
