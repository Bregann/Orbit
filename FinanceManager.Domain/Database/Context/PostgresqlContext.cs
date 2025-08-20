using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Domain.Database.Context
{
    public class PostgresqlContext(DbContextOptions<PostgresqlContext> options) : AppDbContext(options)
    {
    }
}