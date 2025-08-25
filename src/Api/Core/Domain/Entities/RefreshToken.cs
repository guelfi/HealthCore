using System;

namespace MobileMed.Api.Core.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRevoked { get; set; } = false;
        public DateTime? RevokedAt { get; set; }

        // Navigation property
        public User User { get; set; } = null!;

        public bool IsActive => !IsRevoked && ExpiresAt > DateTime.UtcNow;
    }
}