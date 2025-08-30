using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Application.DTOs.Admin;
using MobileMed.Api.Core.Domain.Entities;
using MobileMed.Api.Infrastructure.Data;

// Esta é a implementação corrigida do método GetUsersAsync
// Localização: src/Api/Core/Application/Services/AdminService.cs
// Método: GetUsersAsync (substituir o método existente)

public async Task<PagedResponseDto<UserResponseDto>> GetUsersAsync(int page = 1, int pageSize = 10)
{
    try
    {
        _logger.LogInformation("Listando usuários - Página: {Page}, Tamanho: {PageSize}", page, pageSize);

        // Calcular o total de usuários
        var totalUsers = await _context.Users.CountAsync();
        
        // Calcular o número total de páginas
        var totalPages = (int)Math.Ceiling((double)totalUsers / pageSize);

        var users = await _context.Users
            .OrderBy(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        _logger.LogInformation("Listagem concluída. Usuários retornados: {Count}", users.Count);
        
        // Retornar resposta paginada
        return new PagedResponseDto<UserResponseDto>
        {
            Data = users,
            Total = totalUsers,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages
        };
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Erro ao listar usuários");
        throw;
    }
}