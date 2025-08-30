using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Domain.Entities;
using MobileMed.Api.Infrastructure.Data;

// Esta é a implementação corrigida do método GetExamesAsync
// Localização: src/Api/Core/Application/Services/ExameService.cs
// Método: GetExamesAsync (substituir o método existente)

public async Task<PagedResponseDto<ExameDto>> GetExamesAsync(int page, int pageSize)
{
    // Calcular o total de exames
    var totalExames = await _context.Exames.CountAsync();
    
    // Calcular o número total de páginas
    var totalPages = (int)Math.Ceiling((double)totalExames / pageSize);
    
    // Obter os exames da página atual
    var exames = await _context.Exames
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    // Converter para DTOs
    var examesDto = exames.Select(e => new ExameDto
    {
        Id = e.Id,
        PacienteId = e.PacienteId,
        IdempotencyKey = e.IdempotencyKey,
        Modalidade = e.Modalidade.ToString(), // Convert enum to string for DTO
        DataCriacao = e.DataCriacao
    }).ToList();

    // Retornar resposta paginada
    return new PagedResponseDto<ExameDto>
    {
        Data = examesDto,
        Total = totalExames,
        Page = page,
        PageSize = pageSize,
        TotalPages = totalPages
    };
}