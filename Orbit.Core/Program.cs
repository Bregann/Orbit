using Orbit.Domain.Database.Context;
using Orbit.Domain.Enums;
using Orbit.Domain.Helpers;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Interfaces.Helpers;
using Orbit.Domain.Services;
using Hangfire;
using Hangfire.Dashboard.BasicAuthorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using Orbit.Domain.Services.Finance;
using Orbit.Domain.Interfaces.Api.Finance;
using Orbit.Domain.Interfaces.Api.Tasks;
using Orbit.Domain.Services.Tasks;
using Orbit.Domain.Interfaces.Api.Calendar;
using Orbit.Domain.Services.Calendar;
using Orbit.Domain.Interfaces.Api.Documents;
using Orbit.Domain.Services.Documents;
using Orbit.Domain.Interfaces.Api.Shopping;
using Orbit.Domain.Services.Shopping;
using Orbit.Domain.Interfaces.Api.Journal;
using Orbit.Domain.Services.Journal;
using Orbit.Domain.Interfaces.Api.Notes;
using Orbit.Domain.Services.Notes;
using Orbit.Domain.Interfaces.Api.Dashboard;
using Orbit.Domain.Services.Dashboard;

#if DEBUG
using Hangfire.MemoryStorage;
using Testcontainers.PostgreSql;
#else
using Hangfire.PostgreSql;
#endif

Log.Logger = new LoggerConfiguration()
    .WriteTo.Async(x => x.File("/app/Logs/log.log", retainedFileCountLimit: 7, rollingInterval: RollingInterval.Day))
    .WriteTo.Console()
    .Enrich.WithProperty("Application", "Fm-Api" + (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development" ? "-Test" : ""))
    .WriteTo.Seq("http://192.168.1.20:5341")
    .CreateLogger();

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
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IPotsService, PotsService>();
builder.Services.AddScoped<IMonthService, MonthService>();
builder.Services.AddScoped<IHistoricDataService, HistoricDataService>();
builder.Services.AddScoped<ITasksService, TasksService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<IShoppingService, ShoppingService>();
builder.Services.AddScoped<IJournalService, JournalService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<INoteService, NotesService>();
builder.Services.AddScoped<IBankService, BankService>();
builder.Services.AddHttpClient<ICommsSenderClient, CommsSenderClient>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Environment.GetEnvironmentVariable("JwtValidIssuer"),
            ValidAudience = Environment.GetEnvironmentVariable("JwtValidAudience"),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JwtKey")!))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendLocalhost", builder =>
    {
        builder
            .WithOrigins("http://localhost:3000", "https://orbit.bregan.me")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

#if DEBUG
GlobalConfiguration.Configuration.UseMemoryStorage();

var postgresContainer = new PostgreSqlBuilder()
    .WithImage("postgres:16")
    .WithDatabase("financemanagercontainer")
    .WithUsername("testuser")
    .WithPassword("testpass")
    .WithPortBinding(5432, true)
    .Build();

await postgresContainer.StartAsync();

var connectionString = postgresContainer.GetConnectionString();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseLazyLoadingProxies()
           .UseNpgsql(connectionString));

builder.Services.AddHangfire(configuration => configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseMemoryStorage()
        );

#else
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseLazyLoadingProxies()
           .UseNpgsql(Environment.GetEnvironmentVariable("FMApiLive")));

GlobalConfiguration.Configuration.UsePostgreSqlStorage(c => c.UseNpgsqlConnection(Environment.GetEnvironmentVariable("FMApiLive")));

builder.Services.AddHangfire(configuration => configuration
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(Environment.GetEnvironmentVariable("FMApiLive")))
        );
#endif

// hangfire
builder.Services.AddHangfireServer(options => options.SchedulePollingInterval = TimeSpan.FromSeconds(10));

var app = builder.Build();

app.UseCors("AllowFrontendLocalhost");

#if DEBUG
// Seed the database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetService<AppDbContext>();
    var settingsHelper = scope.ServiceProvider.GetRequiredService<IEnvironmentalSettingHelper>();

    if (dbContext == null)
    {
        throw new Exception("DbContext is null");
    }

    // protection to only run when the connection string is to the test container
    var dbConnectionString = dbContext.Database.GetConnectionString();
    if (!string.IsNullOrEmpty(dbConnectionString) &&
        (dbConnectionString.Contains("127.0.0.1") ||
        dbConnectionString.Contains("financemanagercontainer")))
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Database.EnsureCreated();

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
            PasswordClear = environmentalSettingHelper.GetEnviromentalSettingValue(EnvironmentalSettingEnum.HangfirePassword)
        }
    }
})};

app.MapHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = auth
}, JobStorage.Current);

//HangfireJobSetup.SetupRecurringJobs();

app.Run();
