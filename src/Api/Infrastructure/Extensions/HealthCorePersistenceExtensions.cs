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
            database.EnsureBillingSchema();
        }
        catch (Exception exception)
        {
            Log.Error(exception, "Failed to apply HealthCore database migrations");
            throw;
        }
    }

    private static void EnsureBillingSchema(this HealthCoreDbContext database)
    {
        database.Database.ExecuteSqlRaw("""
            CREATE TABLE IF NOT EXISTS "MedicoSubscriptions" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_MedicoSubscriptions" PRIMARY KEY,
                "MedicoId" TEXT NOT NULL,
                "BillingCycle" INTEGER NOT NULL,
                "PaymentMethod" INTEGER NOT NULL,
                "Status" INTEGER NOT NULL,
                "MonthlyAmount" TEXT NOT NULL DEFAULT '49.0',
                "AnnualAmount" TEXT NOT NULL DEFAULT '490.0',
                "TrialStartedAt" TEXT NOT NULL,
                "TrialEndsAt" TEXT NOT NULL,
                "LastPaymentAt" TEXT NULL,
                "NextDueDate" TEXT NULL,
                "SuspendedAt" TEXT NULL,
                "ReactivatedAt" TEXT NULL,
                "Notes" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_MedicoSubscriptions_Medicos_MedicoId"
                    FOREIGN KEY ("MedicoId") REFERENCES "Medicos" ("Id") ON DELETE CASCADE
            );
            """);

        database.Database.ExecuteSqlRaw("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_MedicoSubscriptions_MedicoId"
            ON "MedicoSubscriptions" ("MedicoId");
            """);

        database.Database.ExecuteSqlRaw("""
            INSERT INTO "MedicoSubscriptions" (
                "Id",
                "MedicoId",
                "BillingCycle",
                "PaymentMethod",
                "Status",
                "MonthlyAmount",
                "AnnualAmount",
                "TrialStartedAt",
                "TrialEndsAt",
                "Notes",
                "CreatedAt",
                "UpdatedAt"
            )
            SELECT
                lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
                "Id",
                1,
                1,
                1,
                '49.0',
                '490.0',
                datetime('now'),
                datetime('now', '+30 days'),
                'Teste gratuito criado automaticamente para medico existente.',
                datetime('now'),
                datetime('now')
            FROM "Medicos"
            WHERE NOT EXISTS (
                SELECT 1
                FROM "MedicoSubscriptions"
                WHERE "MedicoSubscriptions"."MedicoId" = "Medicos"."Id"
            );
            """);
    }
}