
using System;

namespace MobileMed.Api.Core.Application.DTOs
{
    public class PacienteDto
    {
        public Guid Id { get; set; }
        public string? Nome { get; set; }
        public DateTime DataNascimento { get; set; }
        public string? Documento { get; set; }
        public DateTime DataCriacao { get; set; }
        
        // Informações do médico associado
        public Guid? MedicoId { get; set; }
        public string? MedicoNome { get; set; }
        public string? MedicoCRM { get; set; }
        public string? MedicoEspecialidade { get; set; }
    }
}
