using System;

namespace HealthCore.Api.Core.Domain.Entities
{
    public class BlacklistedToken
    {
        public Guid Id { get; set; }
        public string TokenId { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime BlacklistedAt { get; set; } = DateTime.UtcNow;
        public string? Reason { get; set; }
    }
}