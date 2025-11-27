using Microsoft.EntityFrameworkCore;

namespace Orbit.Domain.Database.Context
{
    public class PostgresqlContext(DbContextOptions<PostgresqlContext> options) : AppDbContext(options)
    {
    }
}
