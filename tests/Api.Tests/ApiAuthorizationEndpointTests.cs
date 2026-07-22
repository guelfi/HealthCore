using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace HealthCore.Api.Tests;

public sealed class ApiAuthorizationEndpointTests : IAsyncLifetime
{
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;
    private string _databasePath = null!;

    public Task InitializeAsync()
    {
        _databasePath = Path.Combine(AppContext.BaseDirectory, $"integration-{Guid.NewGuid():N}.db");
        Environment.SetEnvironmentVariable("Jwt__Key", "healthcore-integration-test-key-32-bytes-123456");
        Environment.SetEnvironmentVariable("Jwt__Issuer", "HealthCore.Api");
        Environment.SetEnvironmentVariable("Jwt__Audience", "HealthCore.Client");
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", $"Data Source={_databasePath}");
        Environment.SetEnvironmentVariable("AllowedHosts", "*");

        _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });
        _client = _factory.CreateClient();
        return Task.CompletedTask;
    }

    [Theory]
    [InlineData("/pacientes")]
    [InlineData("/exames")]
    [InlineData("/users")]
    [InlineData("/especialidades")]
    [InlineData("/medicos")]
    public async Task ProtectedResourcesRequireAuthentication(string path)
    {
        var response = await _client.GetAsync(path);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task HealthEndpointsRemainPublic()
    {
        var live = await _client.GetAsync("/health/live");
        var health = await _client.GetAsync("/health");

        live.StatusCode.Should().Be(HttpStatusCode.OK);
        health.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RefreshRequiresHttpOnlyCookie()
    {
        using var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
        var response = await _client.PostAsync("/auth/refresh", content);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
    public Task DisposeAsync()
    {
        _client.Dispose();
        _factory.Dispose();
        Environment.SetEnvironmentVariable("Jwt__Key", null);
        Environment.SetEnvironmentVariable("Jwt__Issuer", null);
        Environment.SetEnvironmentVariable("Jwt__Audience", null);
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", null);
        Environment.SetEnvironmentVariable("AllowedHosts", null);
        if (File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }

        return Task.CompletedTask;
    }
}