using HealthCore.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace HealthCore.Api.Infrastructure.Extensions;

public static class HealthCorePersistenceExtensions
{
    public static IServiceCollection AddHealthCorePersistence(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connection = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=database/healthcore.db";

        const string dataSourcePrefix = "Data Source=";
        var databasePath = connection.StartsWith(dataSourcePrefix, StringComparison.OrdinalIgnoreCase)
            ? connection[dataSourcePrefix.Length..]
            : connection;

        if (!Path.IsPathRooted(databasePath))
        {
            databasePath = Path.Combine(environment.ContentRootPath, databasePath);
            connection = $"{dataSourcePrefix}{databasePath}";
        }

        services.AddDbContext<HealthCoreDbContext>(options =>
            options.UseSqlite(connection));

        return services;
    }

    public static void ApplyHealthCoreMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();

        try
        {
            database.Database.Migrate();
        }
        catch (Exception exception)
        {
            Log.Error(exception, "Failed to apply HealthCore database migrations");
            throw;
        }
    }
}