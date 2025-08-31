using System.ComponentModel.DataAnnotations;

namespace MobileMed.Api.Core.Application.DTOs
{
    public class CreateMedicoDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Documento é obrigatório")]
        [StringLength(14, ErrorMessage = "CPF deve ter no máximo 14 caracteres")]
        public string Documento { get; set; } = string.Empty; // CPF
        
        [Required(ErrorMessage = "Data de nascimento é obrigatória")]
        public DateTime DataNascimento { get; set; }
        
        [StringLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }
        
        [EmailAddress(ErrorMessage = "Email deve ter um formato válido")]
        [StringLength(200, ErrorMessage = "Email deve ter no máximo 200 caracteres")]
        public string? Email { get; set; }
        
        [StringLength(500, ErrorMessage = "Endereço deve ter no máximo 500 caracteres")]
        public string? Endereco { get; set; }
        
        [Required(ErrorMessage = "CRM é obrigatório")]
        [StringLength(20, ErrorMessage = "CRM deve ter no máximo 20 caracteres")]
        public string CRM { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "Especialidade deve ter no máximo 100 caracteres")]
        public string? Especialidade { get; set; }
        
        // Dados de usuário
        [Required(ErrorMessage = "Username é obrigatório")]
        [StringLength(50, ErrorMessage = "Username deve ter no máximo 50 caracteres")]
        public string Username { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Password é obrigatória")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password deve ter entre 6 e 100 caracteres")]
        public string Password { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
    }
}