using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Core.Application.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserInfoDto User { get; set; } = new();
    }

    public class UserInfoDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
    }
}