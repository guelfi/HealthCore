using System.ComponentModel.DataAnnotations;
using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Core.Application.DTOs.Admin
{
    public class UpdateUserDto
    {
        [StringLength(50, ErrorMessage = "Username deve ter no máximo 50 caracteres")]
        public string? Username { get; set; }
        
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password deve ter entre 6 e 100 caracteres")]
        public string? Password { get; set; }
        
        public UserRole? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}