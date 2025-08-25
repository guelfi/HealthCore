using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Domain.Entities;
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

        public async Task<List<ExameDto>> GetExamesAsync(int page, int pageSize)
        {
            var exames = await _context.Exames
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return exames.Select(e => new ExameDto
            {
                Id = e.Id,
                PacienteId = e.PacienteId,
                IdempotencyKey = e.IdempotencyKey,
                Modalidade = e.Modalidade.ToString(), // Convert enum to string for DTO
                DataCriacao = e.DataCriacao
            }).ToList();
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
    }
}
