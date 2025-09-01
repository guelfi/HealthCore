namespace MobileMed.Api.Core.Domain.Entities
{
    public class Paciente
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string Documento { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        
        // Relacionamento com Médico (nullable temporariamente para migração)
        public Guid? MedicoId { get; set; }
        public Medico? Medico { get; set; }
        
        public ICollection<Exame> Exames { get; set; } = new List<Exame>();
    }
}