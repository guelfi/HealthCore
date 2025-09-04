using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Domain.Entities;
using MobileMed.Api.Core.Domain.Enums;
using MobileMed.Api.Infrastructure.Data;

namespace MobileMed.Api.Core.Application.Services
{
    public class ExameService
    {
        private readonly MobileMedDbContext _context;

        public ExameService(MobileMedDbContext context)
        {
            _context = context;
        }

        public async Task<ExameDto> CreateExameAsync(CreateExameDto createExameDto)
        {
            // Verificar se o paciente existe
            var paciente = await _context.Pacientes.FindAsync(createExameDto.PacienteId);
            if (paciente == null)
            {
                throw new InvalidOperationException("Paciente não encontrado.");
            }

            // Verificar idempotência
            var exameExistente = await _context.Exames
                .FirstOrDefaultAsync(e => e.IdempotencyKey == createExameDto.IdempotencyKey);

            if (exameExistente != null)
            {
                return new ExameDto
                {
                    Id = exameExistente.Id,
                    PacienteId = exameExistente.PacienteId,
                    IdempotencyKey = exameExistente.IdempotencyKey,
                    Modalidade = exameExistente.Modalidade.ToString(), // Convert enum to string for DTO
                    DataCriacao = exameExistente.DataCriacao
                };
            }

            // Convert string modalidade to enum
            if (!Enum.TryParse(createExameDto.Modalidade, true, out ModalidadeExame modalidadeEnum))
            {
                throw new ArgumentException("Modalidade de exame inválida.");
            }

            var exame = new Exame
            {
                Id = Guid.NewGuid(),
                PacienteId = createExameDto.PacienteId,
                IdempotencyKey = createExameDto.IdempotencyKey,
                Modalidade = modalidadeEnum, // Assign enum value
                DataCriacao = DateTime.UtcNow
            };

            _context.Exames.Add(exame);
            await _context.SaveChangesAsync();

            return new ExameDto
            {
                Id = exame.Id,
                PacienteId = exame.PacienteId,
                IdempotencyKey = exame.IdempotencyKey,
                Modalidade = exame.Modalidade.ToString(), // Convert enum to string for DTO
                DataCriacao = exame.DataCriacao
            };
        }

        public async Task<PagedResponseDto<ExameDto>> GetExamesAsync(int page, int pageSize, string? modalidade = null, Guid? pacienteId = null, DateTime? dataInicio = null, DateTime? dataFim = null, Guid? medicoId = null)
        {
            var query = _context.Exames.AsQueryable();

            // Filtrar por médico se especificado (apenas exames dos pacientes do médico)
            if (medicoId.HasValue)
            {
                query = query.Where(e => _context.Pacientes.Any(p => p.Id == e.PacienteId && p.MedicoId == medicoId.Value));
            }

            // Aplicar filtros
            if (!string.IsNullOrEmpty(modalidade) && Enum.TryParse(modalidade, true, out ModalidadeExame modalidadeEnum))
            {
                query = query.Where(e => e.Modalidade == modalidadeEnum);
            }

            if (pacienteId.HasValue)
            {
                query = query.Where(e => e.PacienteId == pacienteId.Value);
            }

            if (dataInicio.HasValue)
            {
                query = query.Where(e => e.DataCriacao >= dataInicio.Value);
            }

            if (dataFim.HasValue)
            {
                query = query.Where(e => e.DataCriacao <= dataFim.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var exames = await query
                .Include(e => e.Paciente)
                .OrderByDescending(e => e.DataCriacao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var exameDtos = exames.Select(e => new ExameDto
            {
                Id = e.Id,
                PacienteId = e.PacienteId,
                IdempotencyKey = e.IdempotencyKey,
                Modalidade = e.Modalidade.ToString(),
                DataCriacao = e.DataCriacao
            }).ToList();

            return new PagedResponseDto<ExameDto>
            {
                Data = exameDtos,
                Page = page,
                PageSize = pageSize,
                Total = totalCount,
                TotalPages = totalPages
            };
        }

        public async Task<ExameDto?> UpdateExameAsync(Guid id, UpdateExameDto updateExameDto)
        {
            var exame = await _context.Exames.FindAsync(id);

            if (exame == null)
            {
                return null; // Exame não encontrado
            }

            // Verificar se o paciente existe
            var paciente = await _context.Pacientes.FindAsync(updateExameDto.PacienteId);
            if (paciente == null)
            {
                throw new InvalidOperationException("Paciente não encontrado.");
            }

            // Verificar se a nova idempotencyKey já existe para outro exame
            var exameComMesmaIdempotencyKey = await _context.Exames
                .FirstOrDefaultAsync(e => e.IdempotencyKey == updateExameDto.IdempotencyKey && e.Id != id);

            if (exameComMesmaIdempotencyKey != null)
            {
                throw new InvalidOperationException("Já existe outro exame com esta idempotencyKey.");
            }

            // Convert string modalidade to enum
            if (!Enum.TryParse(updateExameDto.Modalidade, true, out ModalidadeExame modalidadeEnum))
            {
                throw new ArgumentException("Modalidade de exame inválida.");
            }

            exame.PacienteId = updateExameDto.PacienteId;
            exame.IdempotencyKey = updateExameDto.IdempotencyKey;
            exame.Modalidade = modalidadeEnum; // Assign enum value

            await _context.SaveChangesAsync();

            return new ExameDto
            {
                Id = exame.Id,
                PacienteId = exame.PacienteId,
                IdempotencyKey = exame.IdempotencyKey,
                Modalidade = exame.Modalidade.ToString(), // Convert enum to string for DTO
                DataCriacao = exame.DataCriacao
            };
        }

        public async Task<ExameDto?> GetExameByIdAsync(Guid id)
        {
            var exame = await _context.Exames
                .Include(e => e.Paciente)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exame == null)
            {
                return null;
            }

            return new ExameDto
            {
                Id = exame.Id,
                PacienteId = exame.PacienteId,
                IdempotencyKey = exame.IdempotencyKey,
                Modalidade = exame.Modalidade.ToString(),
                DataCriacao = exame.DataCriacao
            };
        }

        public async Task<bool> DeleteExameAsync(Guid id)
        {
            var exame = await _context.Exames.FindAsync(id);
            if (exame == null)
            {
                return false; // Exame não encontrado
            }

            _context.Exames.Remove(exame);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckIdempotencyAsync(string idempotencyKey)
        {
            var exameExistente = await _context.Exames
                .FirstOrDefaultAsync(e => e.IdempotencyKey == idempotencyKey);
            
            return exameExistente != null;
        }

        public async Task<List<object>> GetStatisticsByModalidadeAsync()
        {
            var statistics = await _context.Exames
                .GroupBy(e => e.Modalidade)
                .Select(g => new 
                {
                    Modalidade = g.Key.ToString(),
                    Quantidade = g.Count()
                })
                .OrderByDescending(s => s.Quantidade)
                .ToListAsync();

            return statistics.Cast<object>().ToList();
        }

        public async Task<List<object>> GetStatisticsByPeriodoAsync(DateTime? dataInicio = null, DateTime? dataFim = null)
        {
            var query = _context.Exames.AsQueryable();

            // Se não foram fornecidas datas, usar os últimos 6 meses
            if (!dataInicio.HasValue || !dataFim.HasValue)
            {
                dataFim = DateTime.UtcNow;
                dataInicio = dataFim.Value.AddMonths(-6);
            }

            // Filtrar por período
            query = query.Where(e => e.DataCriacao >= dataInicio.Value && e.DataCriacao <= dataFim.Value);

            var statistics = await query
                .GroupBy(e => new { Year = e.DataCriacao.Year, Month = e.DataCriacao.Month })
                .Select(g => new 
                {
                    Periodo = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Quantidade = g.Count()
                })
                .OrderBy(s => s.Periodo)
                .ToListAsync();

            return statistics.Cast<object>().ToList();
        }
    }
}
