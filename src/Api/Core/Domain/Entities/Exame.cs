using HealthCore.Api.Core.Domain.Enums;

namespace HealthCore.Api.Core.Domain.Entities
{
    public class Exame
    {
        public Guid Id { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public ModalidadeExame Modalidade { get; set; }
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        
        // Relacionamento com Paciente
        public Guid PacienteId { get; set; }
        public Paciente Paciente { get; set; } = null!;
    }
}