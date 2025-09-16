using System.ComponentModel.DataAnnotations;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class CompletarMedicoDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "Documento é obrigatório")]
        [StringLength(20, ErrorMessage = "Documento deve ter no máximo 20 caracteres")]
        public string Documento { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento é obrigatória")]
        public DateTime DataNascimento { get; set; }

        [StringLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [EmailAddress(ErrorMessage = "Email deve ter um formato válido")]
        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }

        [StringLength(200, ErrorMessage = "Endereço deve ter no máximo 200 caracteres")]
        public string? Endereco { get; set; }

        [Required(ErrorMessage = "CRM é obrigatório")]
        [StringLength(20, ErrorMessage = "CRM deve ter no máximo 20 caracteres")]
        public string CRM { get; set; } = string.Empty;

        [Required(ErrorMessage = "Especialidade é obrigatória")]
        [StringLength(100, ErrorMessage = "Especialidade deve ter no máximo 100 caracteres")]
        public string Especialidade { get; set; } = string.Empty;
    }
}