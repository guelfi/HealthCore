using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace HealthCore.Api.Tests;

public class AuthDisplayNameTests
{
    [Theory]
    [InlineData("Marco Guelfi", "Marco Guelfi")]
    [InlineData(null, "admin")]
    public async Task LoginAndRefreshPreserveUsernameAndResolveDisplayName(string? name, string expected)
    {
        var options = new DbContextOptionsBuilder<HealthCoreDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        using var context = new HealthCoreDbContext(options);
        var user = new User { Id = Guid.NewGuid(), Username = "admin", DisplayName = name,
            Role = UserRole.Administrador, IsActive = true };
        user.SetPassword("isolated-test-password");
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "isolated-test-signing-key-with-more-than-32-bytes",
            ["Jwt:Issuer"] = "test", ["Jwt:Audience"] = "test"
        }).Build();
        var service = new AuthService(context, config, NullLogger<AuthService>.Instance,
            new BillingService(context, NullLogger<BillingService>.Instance));
        var login = await service.LoginAsync("admin", "isolated-test-password");
        login.Should().NotBeNull();
        login!.User.Username.Should().Be("admin");
        login.User.DisplayName.Should().Be(expected);
        var refresh = await service.RefreshTokenAsync(login.RefreshToken);
        refresh.Should().NotBeNull();
        refresh!.User.Username.Should().Be("admin");
        refresh.User.DisplayName.Should().Be(expected);
    }
}
