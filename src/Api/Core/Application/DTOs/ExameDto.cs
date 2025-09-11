namespace HealthCore.Api.Core.Application.DTOs
{
    public class ExameDto
    {
        public Guid Id { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public string Modalidade { get; set; } = string.Empty; // Changed to string
        public DateTime DataCriacao { get; set; }
        public Guid PacienteId { get; set; }
    }
}
