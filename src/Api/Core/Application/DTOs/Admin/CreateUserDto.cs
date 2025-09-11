using System.ComponentModel.DataAnnotations;
using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Core.Application.DTOs.Admin
{
    public class CreateUserDto
    {
        [Required(ErrorMessage = "Username é obrigatório")]
        [StringLength(50, ErrorMessage = "Username deve ter no máximo 50 caracteres")]
        public string Username { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Password é obrigatória")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password deve ter entre 6 e 100 caracteres")]
        public string Password { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Role é obrigatório")]
        public UserRole Role { get; set; } = UserRole.Medico;
    }
}