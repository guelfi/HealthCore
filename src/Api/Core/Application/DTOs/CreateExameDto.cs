namespace MobileMed.Api.Core.Application.DTOs
{
    public class CreateExameDto
    {
        public string IdempotencyKey { get; set; } = string.Empty;
        public string Modalidade { get; set; } = string.Empty; // Changed to string
        public Guid PacienteId { get; set; }
    }
}
