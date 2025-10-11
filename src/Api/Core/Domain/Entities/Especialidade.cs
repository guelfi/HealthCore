using System;
using System.Collections.Generic;

namespace HealthCore.Api.Core.Domain.Entities
{
    /// <summary>
    /// Representa uma especialidade médica no sistema
    /// </summary>
    public class Especialidade
    {
        /// <summary>
        /// Identificador único da especialidade
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Nome da especialidade (ex: Cardiologia, Pediatria)
        /// </summary>
        public string Nome { get; set; } = string.Empty;

        /// <summary>
        /// Descrição detalhada da especialidade
        /// </summary>
        public string Descricao { get; set; } = string.Empty;

        /// <summary>
        /// Indica se a especialidade está ativa no sistema
        /// </summary>
        public bool Ativa { get; set; } = true;

        /// <summary>
        /// Data de criação do registro
        /// </summary>
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Data da última atualização do registro
        /// </summary>
        public DateTime? DataAtualizacao { get; set; }

        /// <summary>
        /// Relacionamento 1:N - Médicos que possuem esta especialidade
        /// </summary>
        public ICollection<Medico> Medicos { get; set; } = new List<Medico>();
    }
}
