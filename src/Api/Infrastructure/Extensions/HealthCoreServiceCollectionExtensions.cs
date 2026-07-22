using HealthCore.Api.Infrastructure.Security;
using Microsoft.AspNetCore.RateLimiting;
using System.Diagnostics;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Infrastructure.HealthChecks;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;

namespace HealthCore.Api.Infrastructure.Extensions;

public static class HealthCoreServiceCollectionExtensions
{
    public static IServiceCollection AddHealthCorePlatform(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();
        services.AddMemoryCache();

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddFixedWindowLimiter("auth", limiterOptions =>
            {
                limiterOptions.PermitLimit = configuration.GetValue<int>("RateLimiting:Auth:PermitLimit", 10);
                limiterOptions.Window = TimeSpan.FromMinutes(
                    configuration.GetValue<double>("RateLimiting:Auth:WindowMinutes", 5));
                limiterOptions.QueueLimit = 0;
            });
        });

        services.AddScoped<DatabasePerformanceHealthCheck>();

        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "HealthCore API",
                Version = "v1"
            });
        });

        services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        });

        services.AddHealthChecks()
            .AddDbContextCheck<HealthCoreDbContext>(
                "database",
                failureStatus: HealthStatus.Unhealthy,
                tags: new[] { "db", "sql", "ready" })
            .AddCheck("filesystem", () =>
            {
                try
                {
                    var logPath = Path.Combine(Directory.GetCurrentDirectory(), "log");
                    Directory.CreateDirectory(logPath);

                    var testFile = Path.Combine(logPath, "health-check.tmp");
                    File.WriteAllText(testFile, DateTime.UtcNow.ToString("O"));
                    File.Delete(testFile);

                    var drive = new DriveInfo(Path.GetPathRoot(Directory.GetCurrentDirectory())!);
                    var freeSpaceGb = drive.AvailableFreeSpace / (1024.0 * 1024 * 1024);
                    var minimumFreeSpaceGb = configuration.GetValue<double>(
                        "HealthChecks:MinDiskSpaceGB", 1.0);

                    return freeSpaceGb < minimumFreeSpaceGb
                        ? HealthCheckResult.Degraded($"Low disk space: {freeSpaceGb:F2} GB available")
                        : HealthCheckResult.Healthy($"Filesystem accessible. Free space: {freeSpaceGb:F2} GB");
                }
                catch (Exception exception)
                {
                    return HealthCheckResult.Unhealthy("Filesystem check failed", exception);
                }
            }, tags: new[] { "filesystem", "ready" })
            .AddCheck("memory", () =>
            {
                var gcBytes = GC.GetTotalMemory(false);
                var workingSetBytes = Environment.WorkingSet;
                var maximumMemoryMb = configuration.GetValue<long>(
                    "HealthChecks:MaxMemoryUsageMB", 512);
                var maximumMemoryBytes = maximumMemoryMb * 1024 * 1024;
                var workingSetMb = workingSetBytes / 1024 / 1024;
                var gcMb = gcBytes / 1024 / 1024;

                return workingSetBytes > maximumMemoryBytes
                    ? HealthCheckResult.Degraded(
                        $"High memory usage: Working Set {workingSetMb} MB, GC {gcMb} MB")
                    : HealthCheckResult.Healthy(
                        $"Memory usage normal: Working Set {workingSetMb} MB, GC {gcMb} MB");
            }, tags: new[] { "memory", "live" })
            .AddCheck<DatabasePerformanceHealthCheck>(
                "database-performance",
                tags: new[] { "db", "performance", "ready" })
            .AddCheck("application-startup", () =>
            {
                var uptime = DateTime.UtcNow -
                    Process.GetCurrentProcess().StartTime.ToUniversalTime();

                return uptime.TotalSeconds < 30
                    ? HealthCheckResult.Degraded(
                        $"Application still warming up: {uptime.TotalSeconds:F0}s")
                    : HealthCheckResult.Healthy(
                        $"Application running: {uptime.TotalMinutes:F1} minutes");
            }, tags: new[] { "startup", "live" });

        services.AddScoped<PacienteService>();
        services.AddScoped<ExameService>();
        services.AddScoped<MedicoService>();
        services.AddScoped<EspecialidadeService>();
        services.AddScoped<UserService>();
        services.AddScoped<AuthService>();
        services.AddScoped<AdminService>();
        services.AddScoped<ResourceAuthorizationService>();

        return services;
    }
}