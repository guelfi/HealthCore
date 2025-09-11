using System.ComponentModel.DataAnnotations;

namespace HealthCore.Api.Core.Application.DTOs
{
    public class UpdateExameDto
    {
        [Required(ErrorMessage = "PacienteId é obrigatório")]
        public Guid PacienteId { get; set; }
        
        [Required(ErrorMessage = "IdempotencyKey é obrigatória")]
        public string IdempotencyKey { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Modalidade é obrigatória")]
        public string Modalidade { get; set; } = string.Empty;
    }
}