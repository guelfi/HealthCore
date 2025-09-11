using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Infrastructure.HealthChecks;

public class DatabasePerformanceHealthCheck : IHealthCheck
{
    private readonly HealthCoreDbContext _context;
    private readonly IConfiguration _configuration;

    public DatabasePerformanceHealthCheck(HealthCoreDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            await _context.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
            stopwatch.Stop();
            
            var maxResponseTimeMs = _configuration.GetValue<int>("HealthChecks:DatabaseTimeoutSeconds", 5) * 1000;
            
            if (stopwatch.ElapsedMilliseconds > maxResponseTimeMs)
            {
                return HealthCheckResult.Degraded(
                    $"Database response slow: {stopwatch.ElapsedMilliseconds}ms");
            }
            
            return HealthCheckResult.Healthy(
                $"Database responsive: {stopwatch.ElapsedMilliseconds}ms");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database performance check failed", ex);
        }
    }
}