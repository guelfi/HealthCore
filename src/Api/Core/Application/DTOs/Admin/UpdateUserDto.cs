using MobileMed.Api.Core.Domain.Enums;

namespace MobileMed.Api.Core.Application.DTOs.Admin
{
    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public UserRole? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}