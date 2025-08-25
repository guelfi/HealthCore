using MobileMed.Api.Core.Domain.Enums;

namespace MobileMed.Api.Core.Application.DTOs.Admin
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}