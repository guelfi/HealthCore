using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HealthCore.Api.Core.Application.DTOs.Auth;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Core.Application.Services
{
    public class AuthService
    {
        private readonly HealthCoreDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly BillingService _billingService;

        public AuthService(HealthCoreDbContext context, IConfiguration configuration, ILogger<AuthService> logger, BillingService billingService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _billingService = billingService;
        }

        public async Task<LoginResponseDto?> LoginAsync(string username, string password)
        {
            try
            {
                _logger.LogInformation("Tentativa de login para usuÃ¡rio: {Username}", username);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

                if (user == null || !user.VerifyPassword(password))
                {
                    _logger.LogWarning("Falha na autenticaÃ§Ã£o para usuÃ¡rio: {Username}", username);
                    return null;
                }

                if (!await _billingService.EnsureUserCanAccessAsync(user))
                {
                    _logger.LogWarning("Assinatura bloqueada para usuario: {Username}", username);
                    return null;
                }

                // Revogar tokens de refresh existentes
                await RevokeUserRefreshTokensAsync(user.Id);

                var displayName = await GetDisplayNameAsync(user);

                // Gerar novos tokens
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = await GenerateRefreshTokenAsync(user.Id);

                _logger.LogInformation("Login bem-sucedido para usuÃ¡rio: {Username}", username);

                return new LoginResponseDto
                {
                    Token = jwtToken.Token,
                    RefreshToken = refreshToken.Token,
                    ExpiresAt = jwtToken.ExpiresAt,
                    User = new UserInfoDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        DisplayName = displayName,
                        Role = user.Role,
                        IsActive = user.IsActive
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante login para usuÃ¡rio: {Username}", username);
                throw;
            }
        }

        public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshTokenValue)
        {
            try
            {
                _logger.LogInformation("Tentativa de refresh token");

                var refreshToken = await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue);

                if (refreshToken == null || !refreshToken.IsActive)
                {
                    _logger.LogWarning("Refresh token invÃ¡lido ou expirado");
                    return null;
                }

                if (!refreshToken.User.IsActive || !await _billingService.EnsureUserCanAccessAsync(refreshToken.User))
                {
                    _logger.LogWarning("Refresh token bloqueado por assinatura ou usuario inativo");
                    return null;
                }

                // Revogar o refresh token usado
                refreshToken.IsRevoked = true;
                refreshToken.RevokedAt = DateTime.UtcNow;

                var displayName = await GetDisplayNameAsync(refreshToken.User);

                // Gerar novos tokens
                var jwtToken = GenerateJwtToken(refreshToken.User);
                var newRefreshToken = await GenerateRefreshTokenAsync(refreshToken.User.Id);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refresh token bem-sucedido para usuÃ¡rio: {Username}", refreshToken.User.Username);

                return new LoginResponseDto
                {
                    Token = jwtToken.Token,
                    RefreshToken = newRefreshToken.Token,
                    ExpiresAt = jwtToken.ExpiresAt,
                    User = new UserInfoDto
                    {
                        Id = refreshToken.User.Id,
                        Username = refreshToken.User.Username,
                        DisplayName = displayName,
                        Role = refreshToken.User.Role,
                        IsActive = refreshToken.User.IsActive
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante refresh token");
                throw;
            }
        }

        public async Task<bool> LogoutAsync(string tokenId, string reason = "User logout")
        {
            try
            {
                _logger.LogInformation("Logout iniciado para token: {TokenId}", tokenId);

                // Adicionar token Ã  blacklist
                var blacklistedToken = new BlacklistedToken
                {
                    Id = Guid.NewGuid(),
                    TokenId = tokenId,
                    ExpiresAt = DateTime.UtcNow.AddHours(24), // Manter na blacklist por 24h
                    Reason = reason
                };

                _context.BlacklistedTokens.Add(blacklistedToken);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Token adicionado Ã  blacklist: {TokenId}", tokenId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante logout para token: {TokenId}", tokenId);
                return false;
            }
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshTokenValue)
        {
            if (string.IsNullOrWhiteSpace(refreshTokenValue))
            {
                return false;
            }

            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshTokenValue && !rt.IsRevoked);

            if (refreshToken == null)
            {
                return false;
            }

            refreshToken.IsRevoked = true;
            refreshToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> IsTokenBlacklistedAsync(string tokenId)
        {
            return await _context.BlacklistedTokens
                .AnyAsync(bt => bt.TokenId == tokenId && bt.ExpiresAt > DateTime.UtcNow);
        }


        private async Task<string> GetDisplayNameAsync(User user)
        {
            var medicoNome = await _context.Medicos
                .Where(m => m.UserId == user.Id)
                .Select(m => m.Nome)
                .FirstOrDefaultAsync();

            return string.IsNullOrWhiteSpace(medicoNome) ? user.Username : medicoNome;
        }
        private (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
            {
                throw new InvalidOperationException("Jwt:Key must be configured and contain at least 32 UTF-8 bytes.");
            }

            var key = Encoding.UTF8.GetBytes(jwtSecret);
            var issuer = _configuration["Jwt:Issuer"] ?? "HealthCore.Api";
            var audience = _configuration["Jwt:Audience"] ?? "HealthCore.Client";
            var expiryMinutes = _configuration.GetValue<int>("Jwt:ExpiryMinutes", 15);
            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Token ID para blacklist
                    new Claim(JwtRegisteredClaimNames.Iat, 
                        new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                        ClaimValueTypes.Integer64)
                }),
                Expires = expiresAt,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return (tokenString, expiresAt);
        }

        private async Task<RefreshToken> GenerateRefreshTokenAsync(Guid userId)
        {
            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = GenerateRandomToken(),
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7))
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        private async Task RevokeUserRefreshTokensAsync(Guid userId)
        {
            var userTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in userTokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            if (userTokens.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        private static string GenerateRandomToken()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[64];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        // MÃ©todo para limpeza de tokens expirados (pode ser chamado por um job)
        public async Task CleanupExpiredTokensAsync()
        {
            try
            {
                var now = DateTime.UtcNow;

                // Remover refresh tokens expirados
                var expiredRefreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.ExpiresAt <= now)
                    .ToListAsync();

                _context.RefreshTokens.RemoveRange(expiredRefreshTokens);

                // Remover tokens da blacklist expirados
                var expiredBlacklistedTokens = await _context.BlacklistedTokens
                    .Where(bt => bt.ExpiresAt <= now)
                    .ToListAsync();

                _context.BlacklistedTokens.RemoveRange(expiredBlacklistedTokens);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Limpeza de tokens expirados concluÃ­da. Refresh tokens removidos: {RefreshCount}, Blacklisted tokens removidos: {BlacklistCount}",
                    expiredRefreshTokens.Count, expiredBlacklistedTokens.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante limpeza de tokens expirados");
            }
        }
    }
}