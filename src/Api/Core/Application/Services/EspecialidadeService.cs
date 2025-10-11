using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Core.Application.Services
{
    public class EspecialidadeService(HealthCoreDbContext context, ILogger<EspecialidadeService> logger)
    {
        private readonly HealthCoreDbContext _context = context;
        private readonly ILogger<EspecialidadeService> _logger = logger;

        /// <summary>
        /// Obtém lista paginada de especialidades com filtros opcionais
        /// </summary>
        public async Task<PaginatedEspecialidadesDto> GetAllAsync(
            int page = 1, 
            int pageSize = 10, 
            bool? ativa = null, 
            string? search = null)
        {
            _logger.LogInformation("Buscando especialidades - Page: {Page}, PageSize: {PageSize}, Ativa: {Ativa}, Search: {Search}", 
                page, pageSize, ativa, search);

            var query = _context.Especialidades.AsQueryable();

            // Filtro por status ativo/inativo
            if (ativa.HasValue)
            {
                query = query.Where(e => e.Ativa == ativa.Value);
            }

            // Filtro por busca no nome
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(e => e.Nome.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var especialidades = await query
                .OrderBy(e => e.Nome)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EspecialidadeDto
                {
                    Id = e.Id,
                    Nome = e.Nome,
                    Descricao = e.Descricao,
                    Ativa = e.Ativa,
                    DataCriacao = e.DataCriacao,
                    DataAtualizacao = e.DataAtualizacao
                })
                .ToListAsync();

            _logger.LogInformation("Encontradas {Count} especialidades de um total de {Total}", 
                especialidades.Count, totalItems);

            return new PaginatedEspecialidadesDto
            {
                Items = especialidades,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        /// <summary>
        /// Obtém uma especialidade por ID
        /// </summary>
        public async Task<EspecialidadeDto?> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Buscando especialidade por ID: {Id}", id);

            var especialidade = await _context.Especialidades
                .Where(e => e.Id == id)
                .Select(e => new EspecialidadeDto
                {
                    Id = e.Id,
                    Nome = e.Nome,
                    Descricao = e.Descricao,
                    Ativa = e.Ativa,
                    DataCriacao = e.DataCriacao,
                    DataAtualizacao = e.DataAtualizacao
                })
                .FirstOrDefaultAsync();

            if (especialidade == null)
            {
                _logger.LogWarning("Especialidade não encontrada: {Id}", id);
            }

            return especialidade;
        }

        /// <summary>
        /// Cria uma nova especialidade
        /// </summary>
        public async Task<EspecialidadeDto> CreateAsync(CreateEspecialidadeDto dto)
        {
            _logger.LogInformation("Criando nova especialidade: {Nome}", dto.Nome);

            // Verificar se já existe especialidade com o mesmo nome
            if (await ExistsByNameAsync(dto.Nome))
            {
                _logger.LogWarning("Tentativa de criar especialidade com nome já existente: {Nome}", dto.Nome);
                throw new InvalidOperationException($"Já existe uma especialidade cadastrada com o nome '{dto.Nome}'.");
            }

            var especialidade = new Especialidade
            {
                Id = Guid.NewGuid(),
                Nome = dto.Nome.Trim(),
                Descricao = dto.Descricao?.Trim() ?? string.Empty,
                Ativa = dto.Ativa,
                DataCriacao = DateTime.UtcNow,
                DataAtualizacao = null
            };

            _context.Especialidades.Add(especialidade);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Especialidade criada com sucesso: {Id} - {Nome}", especialidade.Id, especialidade.Nome);

            return new EspecialidadeDto
            {
                Id = especialidade.Id,
                Nome = especialidade.Nome,
                Descricao = especialidade.Descricao,
                Ativa = especialidade.Ativa,
                DataCriacao = especialidade.DataCriacao,
                DataAtualizacao = especialidade.DataAtualizacao
            };
        }

        /// <summary>
        /// Atualiza uma especialidade existente
        /// </summary>
        public async Task<EspecialidadeDto> UpdateAsync(Guid id, UpdateEspecialidadeDto dto)
        {
            _logger.LogInformation("Atualizando especialidade: {Id}", id);

            var especialidade = await _context.Especialidades.FindAsync(id);
            
            if (especialidade == null)
            {
                _logger.LogWarning("Especialidade não encontrada para atualização: {Id}", id);
                throw new InvalidOperationException("Especialidade não encontrada.");
            }

            // Verificar se o novo nome já existe em outra especialidade
            if (await ExistsByNameAsync(dto.Nome, id))
            {
                _logger.LogWarning("Tentativa de atualizar especialidade com nome já existente: {Nome}", dto.Nome);
                throw new InvalidOperationException($"Já existe outra especialidade cadastrada com o nome '{dto.Nome}'.");
            }

            especialidade.Nome = dto.Nome.Trim();
            especialidade.Descricao = dto.Descricao?.Trim() ?? string.Empty;
            especialidade.Ativa = dto.Ativa;
            especialidade.DataAtualizacao = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Especialidade atualizada com sucesso: {Id} - {Nome}", especialidade.Id, especialidade.Nome);

            return new EspecialidadeDto
            {
                Id = especialidade.Id,
                Nome = especialidade.Nome,
                Descricao = especialidade.Descricao,
                Ativa = especialidade.Ativa,
                DataCriacao = especialidade.DataCriacao,
                DataAtualizacao = especialidade.DataAtualizacao
            };
        }

        /// <summary>
        /// Exclui uma especialidade
        /// </summary>
        public async Task<bool> DeleteAsync(Guid id)
        {
            _logger.LogInformation("Excluindo especialidade: {Id}", id);

            var especialidade = await _context.Especialidades.FindAsync(id);
            
            if (especialidade == null)
            {
                _logger.LogWarning("Especialidade não encontrada para exclusão: {Id}", id);
                return false;
            }

            // Verificar se existem médicos vinculados
            var medicosVinculados = await _context.Medicos
                .Where(m => m.EspecialidadeId == id)
                .CountAsync();

            if (medicosVinculados > 0)
            {
                _logger.LogWarning("Tentativa de excluir especialidade com {Count} médicos vinculados: {Id}", medicosVinculados, id);
                throw new InvalidOperationException($"Não é possível excluir esta especialidade pois existem {medicosVinculados} médico(s) vinculado(s). Os vínculos serão removidos automaticamente.");
            }

            _context.Especialidades.Remove(especialidade);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Especialidade excluída com sucesso: {Id} - {Nome}", id, especialidade.Nome);

            return true;
        }

        /// <summary>
        /// Verifica se existe uma especialidade com o nome especificado
        /// </summary>
        public async Task<bool> ExistsByNameAsync(string nome, Guid? excludeId = null)
        {
            var query = _context.Especialidades.Where(e => e.Nome.ToLower() == nome.ToLower().Trim());

            if (excludeId.HasValue)
            {
                query = query.Where(e => e.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
