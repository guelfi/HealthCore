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

        public AuthService(HealthCoreDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<LoginResponseDto?> LoginAsync(string username, string password)
        {
            try
            {
                _logger.LogInformation("Tentativa de login para usuário: {Username}", username);

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

                if (user == null || !user.VerifyPassword(password))
                {
                    _logger.LogWarning("Falha na autenticação para usuário: {Username}", username);
                    return null;
                }

                // Revogar tokens de refresh existentes
                await RevokeUserRefreshTokensAsync(user.Id);

                // Gerar novos tokens
                var jwtToken = GenerateJwtToken(user);
                var refreshToken = await GenerateRefreshTokenAsync(user.Id);

                _logger.LogInformation("Login bem-sucedido para usuário: {Username}", username);

                return new LoginResponseDto
                {
                    Token = jwtToken.Token,
                    RefreshToken = refreshToken.Token,
                    ExpiresAt = jwtToken.ExpiresAt,
                    User = new UserInfoDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Role = user.Role,
                        IsActive = user.IsActive
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante login para usuário: {Username}", username);
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
                    _logger.LogWarning("Refresh token inválido ou expirado");
                    return null;
                }

                // Revogar o refresh token usado
                refreshToken.IsRevoked = true;
                refreshToken.RevokedAt = DateTime.UtcNow;

                // Gerar novos tokens
                var jwtToken = GenerateJwtToken(refreshToken.User);
                var newRefreshToken = await GenerateRefreshTokenAsync(refreshToken.User.Id);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Refresh token bem-sucedido para usuário: {Username}", refreshToken.User.Username);

                return new LoginResponseDto
                {
                    Token = jwtToken.Token,
                    RefreshToken = newRefreshToken.Token,
                    ExpiresAt = jwtToken.ExpiresAt,
                    User = new UserInfoDto
                    {
                        Id = refreshToken.User.Id,
                        Username = refreshToken.User.Username,
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

                // Adicionar token à blacklist
                var blacklistedToken = new BlacklistedToken
                {
                    Id = Guid.NewGuid(),
                    TokenId = tokenId,
                    ExpiresAt = DateTime.UtcNow.AddHours(24), // Manter na blacklist por 24h
                    Reason = reason
                };

                _context.BlacklistedTokens.Add(blacklistedToken);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Token adicionado à blacklist: {TokenId}", tokenId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante logout para token: {TokenId}", tokenId);
                return false;
            }
        }

        public async Task<bool> IsTokenBlacklistedAsync(string tokenId)
        {
            return await _context.BlacklistedTokens
                .AnyAsync(bt => bt.TokenId == tokenId && bt.ExpiresAt > DateTime.UtcNow);
        }

        private (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["Jwt:Key"] ?? "thisIsAVeryStrongAndSecureSecretKeyForJWTAuthentication";
            var key = Encoding.ASCII.GetBytes(jwtSecret);
            var expiresAt = DateTime.UtcNow.AddHours(1); // Token expira em 1 hora

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
                ExpiresAt = DateTime.UtcNow.AddDays(7) // Refresh token expira em 7 dias
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

        // Método para limpeza de tokens expirados (pode ser chamado por um job)
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

                _logger.LogInformation("Limpeza de tokens expirados concluída. Refresh tokens removidos: {RefreshCount}, Blacklisted tokens removidos: {BlacklistCount}",
                    expiredRefreshTokens.Count, expiredBlacklistedTokens.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante limpeza de tokens expirados");
            }
        }
    }
}