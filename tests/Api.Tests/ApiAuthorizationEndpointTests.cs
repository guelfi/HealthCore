using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.DependencyInjection;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Core.Domain.Entities;

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

    [Fact]
    public async Task ProfileRequiresAuthentication()
    {
        var response = await _client.PutAsJsonAsync("/me", new { displayName = "Example" });
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProfileUpdatesOnlyTheAuthenticatedUserAndPreservesLogin()
    {
        var id = Guid.NewGuid();
        var username = "profile-test-" + id.ToString("N");
        using (var scope = _factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
            database.Users.Add(new User { Id = id, Username = username, PasswordHash = "unchanged-test-hash", IsActive = true });
            await database.SaveChangesAsync();
        }
        var jwt = new JwtSecurityToken("HealthCore.Api", "HealthCore.Client",
            new[] { new Claim(ClaimTypes.NameIdentifier, id.ToString()) }, expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                "healthcore-integration-test-key-32-bytes-123456")), SecurityAlgorithms.HmacSha256));
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(jwt));
        var response = await _client.PutAsJsonAsync("/me", new { displayName = "Marco Guelfi", userId = Guid.NewGuid() });
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        using var verifyScope = _factory.Services.CreateScope();
        var saved = await verifyScope.ServiceProvider.GetRequiredService<HealthCoreDbContext>().Users.FindAsync(id);
        saved!.DisplayName.Should().Be("Marco Guelfi");
        saved.Username.Should().Be(username);
        saved.PasswordHash.Should().Be("unchanged-test-hash");
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
