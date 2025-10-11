using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HealthCore.Api.Core.Application.DTOs
{
    /// <summary>
    /// DTO para leitura de Especialidade
    /// </summary>
    public class EspecialidadeDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public bool Ativa { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataAtualizacao { get; set; }
    }

    /// <summary>
    /// DTO para criação de Especialidade
    /// </summary>
    public class CreateEspecialidadeDto
    {
        [Required(ErrorMessage = "O nome é obrigatório")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string? Descricao { get; set; }

        public bool Ativa { get; set; } = true;
    }

    /// <summary>
    /// DTO para atualização de Especialidade
    /// </summary>
    public class UpdateEspecialidadeDto
    {
        [Required(ErrorMessage = "O nome é obrigatório")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string? Descricao { get; set; }

        public bool Ativa { get; set; }
    }

    /// <summary>
    /// DTO para resposta paginada de Especialidades
    /// </summary>
    public class PaginatedEspecialidadesDto
    {
        public List<EspecialidadeDto> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
