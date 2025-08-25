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

        public async Task<List<PacienteDto>> GetPacientesAsync(int page, int pageSize)
        {
            var pacientes = await _context.Pacientes
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return pacientes.Select(p => new PacienteDto
            {
                Id = p.Id,
                Nome = p.Nome,
                DataNascimento = p.DataNascimento,
                Documento = p.Documento
            }).ToList();
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
    }
}
