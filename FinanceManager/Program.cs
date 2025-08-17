using FinanceManager.Domain.Enums;
using FinanceManager.Domain.Helpers;
using FinanceManager.Domain.Interfaces.Helpers;
using FinanceManager.Domain.Database.Context;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.Dashboard.BasicAuthorization;
using Hangfire.MemoryStorage;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using FinanceManager.Domain.Interfaces.Api;
using FinanceManager.Domain.Data.Services;

Log.Logger = new LoggerConfiguration().WriteTo.Async(x => x.File("/app/Logs/log.log", retainedFileCountLimit: 7, rollingInterval: RollingInterval.Day)).WriteTo.Console().CreateLogger();
Log.Information("Logger Setup");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpContextAccessor();

// Add in our own services
builder.Services.AddSingleton<IEnvironmentalSettingHelper, EnvironmentalSettingHelper>();
builder.Services.AddScoped<IBankApiHelper, BankApiHelper>();

// Add in the auth
builder.Services.AddAuthorization();

// add in controller data services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITransactionsService, TransactionsService>();
builder.Services.AddScoped<IStatsService, StatsService>();
builder.Services.AddScoped<IPotsService, PotsService>();

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,
//            ValidIssuer = Environment.GetEnvironmentVariable("JwtValidIssuer"),
//            ValidAudience = Environment.GetEnvironmentVariable("JwtValidAudience"),
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JwtKey")!))
//        };
//    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


#if DEBUG
builder.Services.AddDbContext<SqliteContext>(options =>
    options.UseLazyLoadingProxies()
           .UseSqlite($"Data Source={Directory.GetCurrentDirectory()}/application.db"));
builder.Services.AddScoped<AppDbContext>(provider => provider.GetService<SqliteContext>());

GlobalConfiguration.Configuration.UseMemoryStorage();

builder.Services.AddHangfire(configuration => configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseMemoryStorage()
        );


#else
builder.Services.AddDbContext<PostgresqlContext>(options =>
    options.UseLazyLoadingProxies()
           .UseNpgsql(Environment.GetEnvironmentVariable("xxxConnStringLive")));
builder.Services.AddScoped<AppDbContext>(provider => provider.GetService<PostgresqlContext>());

GlobalConfiguration.Configuration.UsePostgreSqlStorage(c => c.UseNpgsqlConnection(Environment.GetEnvironmentVariable("xxxConnString")));

builder.Services.AddHangfire(configuration => configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(Environment.GetEnvironmentVariable("xxxConnString")))
        );


#endif

// hangfire
builder.Services.AddHangfireServer(options => options.SchedulePollingInterval = TimeSpan.FromSeconds(10));

var app = builder.Build();

app.UseCors("AllowAll");

#if DEBUG
// Seed the database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetService<AppDbContext>()!;
    var settingsHelper = scope.ServiceProvider.GetRequiredService<IEnvironmentalSettingHelper>();

    if (dbContext.Database.GetPendingMigrations().Any())
    {
        await dbContext.Database.MigrateAsync();
        await DatabaseSeedHelper.SeedDatabase(dbContext, settingsHelper, scope.ServiceProvider);
    }
}
#endif

var environmentalSettingHelper = app.Services.GetService<IEnvironmentalSettingHelper>()!;
await environmentalSettingHelper.LoadEnvironmentalSettings();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseHangfireDashboard();

var auth = new[] { new BasicAuthAuthorizationFilter(new BasicAuthAuthorizationFilterOptions
{
    RequireSsl = false,
    SslRedirect = false,
    LoginCaseSensitive = true,
    Users = new []
    {
        new BasicAuthAuthorizationUser
        {
            Login = environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.HangfireUsername),
            PasswordClear = environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.HangfireUsername)
        }
    }
})};

app.MapHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = auth
}, JobStorage.Current);

app.Run();