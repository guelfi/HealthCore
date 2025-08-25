using MobileMed.Api.Core.Domain.Entities;

namespace MobileMed.Api.Core.Application.DTOs
{
    public class UpdateExameDto
    {
        public Guid PacienteId { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public string Modalidade { get; set; } = string.Empty; // Changed to string
    }
}