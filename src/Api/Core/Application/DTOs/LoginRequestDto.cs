using System.ComponentModel.DataAnnotations;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Username é obrigatório")]
        public string Username { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Password é obrigatória")]
        public string Password { get; set; } = string.Empty;
    }
}
