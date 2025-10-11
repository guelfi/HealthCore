using System;
using System.Collections.Generic;

namespace HealthCore.Api.Core.Domain.Entities
{
    public class Medico
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // FK para Users
        public string Nome { get; set; } = string.Empty;
        
        public string Documento { get; set; } = string.Empty; // CPF
        public DateTime DataNascimento { get; set; }
        public string Telefone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        public string CRM { get; set; } = string.Empty;
        
        // NOTA: Campo Especialidade (string) mantido temporariamente para compatibilidade com frontend
        // Será removido em versão futura quando frontend for migrado para usar EspecialidadeId
        public string Especialidade { get; set; } = string.Empty;
        
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        
        // FK para Especialidade (nullable - opcional)
        public Guid? EspecialidadeId { get; set; }
        
        // Relacionamentos
        public User User { get; set; } = null!;
        public Especialidade? EspecialidadeNavigation { get; set; }
        public ICollection<Paciente> Pacientes { get; set; } = new List<Paciente>();
        public ICollection<Exame> ExamesRealizados { get; set; } = new List<Exame>();
    }
}