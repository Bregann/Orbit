using Microsoft.EntityFrameworkCore;

namespace Orbit.Domain.Database.Context
{
    public class SqliteContext(DbContextOptions<SqliteContext> options) : AppDbContext(options)
    {
    }
}
