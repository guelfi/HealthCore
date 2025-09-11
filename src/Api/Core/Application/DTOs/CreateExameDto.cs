using System.ComponentModel.DataAnnotations;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class CreateExameDto
    {
        [Required(ErrorMessage = "IdempotencyKey é obrigatória")]
        public string IdempotencyKey { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Modalidade é obrigatória")]
        public string Modalidade { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "PacienteId é obrigatório")]
        public Guid PacienteId { get; set; }
    }
}
