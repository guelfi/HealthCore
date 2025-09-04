using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Domain.Entities;
using MobileMed.Api.Infrastructure.Data;

namespace MobileMed.Api.Core.Application.Services
{
    public class PacienteService
    {
        private readonly MobileMedDbContext _context;

        public PacienteService(MobileMedDbContext context)
        {
            _context = context;
        }

        public async Task<PacienteDto> CreatePacienteAsync(CreatePacienteDto createPacienteDto)
        {
            // Verificar se já existe um paciente com o mesmo documento
            var pacienteExistente = await _context.Pacientes
                .FirstOrDefaultAsync(p => p.Documento == createPacienteDto.Documento);
                
            if (pacienteExistente != null)
            {
                throw new InvalidOperationException("Já existe um paciente cadastrado com este documento.");
            }

            var paciente = new Paciente
            {
                Id = Guid.NewGuid(),
                Nome = createPacienteDto.Nome,
                DataNascimento = createPacienteDto.DataNascimento,
                Documento = createPacienteDto.Documento
            };

            _context.Pacientes.Add(paciente);
            await _context.SaveChangesAsync();

            return new PacienteDto
            {
                Id = paciente.Id,
                Nome = paciente.Nome,
                DataNascimento = paciente.DataNascimento,
                Documento = paciente.Documento
            };
        }

        public async Task<PagedResponseDto<PacienteDto>> GetPacientesAsync(int page, int pageSize, Guid? medicoId = null)
        {
            // Criar query base
            var query = _context.Pacientes.AsQueryable();
            
            // Filtrar por médico se especificado
            if (medicoId.HasValue)
            {
                query = query.Where(p => p.MedicoId == medicoId.Value);
            }
            
            // Calcular o total de pacientes (com filtro aplicado)
            var total = await query.CountAsync();
            
            // Obter os pacientes paginados com informações do médico
            var pacientes = await query
                .Include(p => p.Medico)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Converter para DTOs
            var pacienteDtos = pacientes.Select(p => new PacienteDto
            {
                Id = p.Id,
                Nome = p.Nome,
                DataNascimento = p.DataNascimento,
                Documento = p.Documento,
                DataCriacao = p.DataCriacao,
                MedicoId = p.MedicoId,
                MedicoNome = p.Medico?.Nome,
                MedicoCRM = p.Medico?.CRM,
                MedicoEspecialidade = p.Medico?.Especialidade
            }).ToList();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            // Retornar resposta paginada
            return new PagedResponseDto<PacienteDto>
            {
                Data = pacienteDtos,
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<PacienteDto?> UpdatePacienteAsync(Guid id, UpdatePacienteDto updatePacienteDto)
        {
            var paciente = await _context.Pacientes.FindAsync(id);

            if (paciente == null)
            {
                return null; // Paciente não encontrado
            }

            // Verificar se o novo documento já existe para outro paciente
            var pacienteComMesmoDocumento = await _context.Pacientes
                .FirstOrDefaultAsync(p => p.Documento == updatePacienteDto.Documento && p.Id != id);

            if (pacienteComMesmoDocumento != null)
            {
                throw new InvalidOperationException("Já existe outro paciente cadastrado com este documento.");
            }

            paciente.Nome = updatePacienteDto.Nome;
            paciente.DataNascimento = updatePacienteDto.DataNascimento;
            paciente.Documento = updatePacienteDto.Documento;

            await _context.SaveChangesAsync();

            return new PacienteDto
            {
                Id = paciente.Id,
                Nome = paciente.Nome,
                DataNascimento = paciente.DataNascimento,
                Documento = paciente.Documento
            };
        }

        public async Task<bool> DeletePacienteAsync(Guid id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);
            if (paciente == null)
            {
                return false; // Paciente não encontrado
            }

            _context.Pacientes.Remove(paciente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PacienteDto?> GetPacienteByIdAsync(Guid id)
        {
            var paciente = await _context.Pacientes
                .Include(p => p.Medico)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (paciente == null)
            {
                return null;
            }

            return new PacienteDto
            {
                Id = paciente.Id,
                Nome = paciente.Nome,
                DataNascimento = paciente.DataNascimento,
                Documento = paciente.Documento,
                DataCriacao = paciente.DataCriacao,
                MedicoId = paciente.MedicoId,
                MedicoNome = paciente.Medico?.Nome,
                MedicoCRM = paciente.Medico?.CRM,
                MedicoEspecialidade = paciente.Medico?.Especialidade
            };
        }

        public async Task<PagedResponseDto<PacienteDto>> SearchPacientesByNomeAsync(string? nome, int page, int pageSize, Guid? medicoId = null)
        {
            // Criar query base
            var query = _context.Pacientes.AsQueryable();
            
            // Filtrar por nome se especificado
            if (!string.IsNullOrEmpty(nome))
            {
                query = query.Where(p => p.Nome.Contains(nome));
            }
            
            // Filtrar por médico se especificado
            if (medicoId.HasValue)
            {
                query = query.Where(p => p.MedicoId == medicoId.Value);
            }
            
            // Calcular o total de pacientes (com filtros aplicados)
            var total = await query.CountAsync();
            
            // Obter os pacientes paginados com informações do médico
            var pacientes = await query
                .Include(p => p.Medico)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Converter para DTOs
            var pacienteDtos = pacientes.Select(p => new PacienteDto
            {
                Id = p.Id,
                Nome = p.Nome,
                DataNascimento = p.DataNascimento,
                Documento = p.Documento,
                DataCriacao = p.DataCriacao,
                MedicoId = p.MedicoId,
                MedicoNome = p.Medico?.Nome,
                MedicoCRM = p.Medico?.CRM,
                MedicoEspecialidade = p.Medico?.Especialidade
            }).ToList();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            // Retornar resposta paginada
            return new PagedResponseDto<PacienteDto>
            {
                Data = pacienteDtos,
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }
    }
}
