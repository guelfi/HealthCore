using MobileMed.Api.Core.Domain.Enums;

namespace MobileMed.Api.Core.Application.DTOs.Admin
{
    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Medico;
    }
}