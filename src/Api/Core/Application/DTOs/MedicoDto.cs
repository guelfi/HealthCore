using System;

namespace MobileMed.Api.Core.Application.DTOs
{
    public class MedicoDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? Nome { get; set; }
        public string? Documento { get; set; } // CPF
        public DateTime DataNascimento { get; set; }
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Endereco { get; set; }
        public string? CRM { get; set; }
        public string? Especialidade { get; set; }
        public DateTime DataCriacao { get; set; }
        
        // Dados do usuário relacionado
        public string? Username { get; set; }
        public bool IsActive { get; set; }
        public DateTime UserCreatedAt { get; set; }
    }
}