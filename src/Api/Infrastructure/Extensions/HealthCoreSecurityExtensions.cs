using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HealthCore.Api.Core.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

namespace HealthCore.Api.Infrastructure.Extensions;

public static class HealthCoreSecurityExtensions
{
    public static IServiceCollection AddHealthCoreSecurity(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var jwtSecret = configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
        {
            throw new InvalidOperationException(
                "Jwt:Key must be configured and contain at least 32 UTF-8 bytes.");
        }

        var jwtIssuer = configuration["Jwt:Issuer"] ?? "HealthCore.Api";
        var jwtAudience = configuration["Jwt:Audience"] ?? "HealthCore.Client";
        var key = Encoding.UTF8.GetBytes(jwtSecret);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = !environment.IsDevelopment();
            options.SaveToken = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        });

        var openApiEnabled = environment.IsDevelopment() ||
            configuration.GetValue<bool>("OpenApi:Enabled", false);

        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAssertion(context =>
                {
                    if (openApiEnabled &&
                        context.Resource is HttpContext httpContext &&
                        (httpContext.Request.Path.StartsWithSegments("/swagger") ||
                         httpContext.Request.Path.StartsWithSegments("/healthcore/swagger") ||
                         httpContext.Request.Path.StartsWithSegments("/healthcore-api/swagger")))
                    {
                        return true;
                    }

                    return context.User.Identity?.IsAuthenticated == true;
                })
                .Build();
        });

        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowProxy", policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                }
            });
        });

        return services;
    }
}