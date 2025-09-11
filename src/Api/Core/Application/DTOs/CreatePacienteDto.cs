using System.ComponentModel.DataAnnotations;
using HealthCore.Api.Core.Application.Validations;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class CreatePacienteDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 200 caracteres")]
        public string Nome { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Data de nascimento é obrigatória")]
        [DataType(DataType.Date)]
        public DateTime DataNascimento { get; set; }
        
        [Required(ErrorMessage = "CPF é obrigatório")]
        [CpfValidation(ErrorMessage = "CPF inválido")]
        public string Documento { get; set; } = string.Empty;
        
        [StringLength(100, ErrorMessage = "Contato deve ter no máximo 100 caracteres")]
        public string? Contato { get; set; }
    }
}
