using System.ComponentModel.DataAnnotations;

namespace MobileMed.Api.Core.Application.DTOs
{
    public class CreatePacienteDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Data de nascimento é obrigatória")]
        public DateTime DataNascimento { get; set; }
        
        [Required(ErrorMessage = "Documento é obrigatório")]
        [StringLength(20, ErrorMessage = "Documento deve ter no máximo 20 caracteres")]
        public string Documento { get; set; } = string.Empty;
    }
}