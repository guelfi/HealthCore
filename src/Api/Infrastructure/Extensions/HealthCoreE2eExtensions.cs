using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
namespace HealthCore.Api.Infrastructure.Extensions;
public static class HealthCoreE2eExtensions
{
    public static async Task SeedHealthCoreE2eUserAsync(this WebApplication app)
    {
        var username = Environment.GetEnvironmentVariable("HEALTHCORE_E2E_USERNAME");
        var password = Environment.GetEnvironmentVariable("HEALTHCORE_E2E_PASSWORD");
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "E2E environment requires HEALTHCORE_E2E_USERNAME and HEALTHCORE_E2E_PASSWORD.");
        }
        using var scope = app.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
        var user = await database.Users.SingleOrDefaultAsync(candidate => candidate.Username == username);
        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Role = UserRole.Administrador,
                IsActive = true
            };
            user.SetPassword(password);
            database.Users.Add(user);
        }
        else
        {
            user.Role = UserRole.Administrador;
            user.IsActive = true;
            user.SetPassword(password);
        }
        await database.SaveChangesAsync();
    }

    private static readonly string[] DemoSeedUsernames =
    [
        "admin",
        "healthcore.admin",
        "healthcore.medico",
        "medico",
        "dr.ana",
        "dr.bruno",
        "dra.carla",
        "dr.diego",
        "dra.elisa"
    ];

    public static async Task NormalizeHealthCoreDemoPasswordsAsync(this WebApplication app)
    {
        if (!app.Configuration.GetValue<bool>("Seed:NormalizeDemoPasswords"))
        {
            return;
        }

        var password = app.Configuration["Seed:DemoPassword"];
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException("Seed:DemoPassword must be configured when Seed:NormalizeDemoPasswords is enabled.");
        }

        using var scope = app.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
        var users = await database.Users
            .Where(candidate => DemoSeedUsernames.Contains(candidate.Username))
            .ToListAsync();

        foreach (var user in users)
        {
            user.SetPassword(password);
        }

        await database.SaveChangesAsync();
    }
}