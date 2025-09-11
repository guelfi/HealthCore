using System.IdentityModel.Tokens.Jwt;
using HealthCore.Api.Core.Application.Services;

namespace HealthCore.Api.Infrastructure.Middleware
{
    public class TokenBlacklistMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<TokenBlacklistMiddleware> _logger;

        public TokenBlacklistMiddleware(RequestDelegate next, ILogger<TokenBlacklistMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, AuthService authService)
        {
            var token = ExtractTokenFromHeader(context);

            if (!string.IsNullOrEmpty(token))
            {
                var tokenId = ExtractTokenId(token);
                
                if (!string.IsNullOrEmpty(tokenId))
                {
                    var isBlacklisted = await authService.IsTokenBlacklistedAsync(tokenId);
                    
                    if (isBlacklisted)
                    {
                        _logger.LogWarning("Token blacklisted detectado: {TokenId}", tokenId);
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("Token inválido");
                        return;
                    }
                }
            }

            await _next(context);
        }

        private static string? ExtractTokenFromHeader(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }

            return null;
        }

        private static string? ExtractTokenId(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadJwtToken(token);
                return jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}