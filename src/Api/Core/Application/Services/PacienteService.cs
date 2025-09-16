using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Infrastructure.Data;
using System.Linq;

namespace HealthCore.Api.Core.Application.Services
{
    public class PacienteService
    {
        private readonly HealthCoreDbContext _context;

        public PacienteService(HealthCoreDbContext context)
        {
            _context = context;
        }

        public async Task<PacienteDto> CreatePacienteAsync(CreatePacienteDto createPacienteDto)
        {
            // Validações de entrada
            if (string.IsNullOrWhiteSpace(createPacienteDto.Nome))
            {
                throw new ArgumentException("Nome do paciente é obrigatório.", nameof(createPacienteDto.Nome));
            }

            if (string.IsNullOrWhiteSpace(createPacienteDto.Documento) || 
                createPacienteDto.Documento.Length != 11 || 
                !createPacienteDto.Documento.All(char.IsDigit) ||
                createPacienteDto.Documento.All(c => c == createPacienteDto.Documento[0])) // Todos os dígitos iguais
            {
                throw new ArgumentException("Documento deve ter exatamente 11 dígitos numéricos válidos.", nameof(createPacienteDto.Documento));
            }

            if (createPacienteDto.DataNascimento > DateTime.Now)
            {
                throw new ArgumentException("Data de nascimento não pode ser uma data futura.", nameof(createPacienteDto.DataNascimento));
            }

            // Verificar se já existe um paciente com o mesmo documento
            var pacienteExistente = await _context.Pacientes
                .AsNoTracking()
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
            // Validações de entrada
            if (page < 1)
            {
                throw new ArgumentException("Número da página deve ser maior que zero.", nameof(page));
            }

            if (pageSize < 1)
            {
                throw new ArgumentException("Tamanho da página deve ser maior que zero.", nameof(pageSize));
            }

            // Criar query base
            var query = _context.Pacientes
                .AsNoTracking();
            
            // Filtrar por médico se especificado
            if (medicoId.HasValue)
            {
                query = query.Where(p => p.MedicoId == medicoId.Value);
            }
            
            // Aplicar ordenação após filtros
            query = query.OrderBy(p => p.Nome);
            
            // Calcular o total de pacientes (com filtro aplicado)
            var total = await query.CountAsync();
            
            // Usar projeção direta para melhor performance
            var pacienteDtos = await query
                .Select(p => new PacienteDto
                {
                    Id = p.Id,
                    Nome = p.Nome,
                    DataNascimento = p.DataNascimento,
                    Documento = p.Documento,
                    DataCriacao = p.DataCriacao,
                    MedicoId = p.MedicoId,
                    MedicoNome = p.Medico != null ? p.Medico.Nome : null,
                    MedicoCRM = p.Medico != null ? p.Medico.CRM : null,
                    MedicoEspecialidade = p.Medico != null ? p.Medico.Especialidade : null
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

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
                .AsNoTracking()
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
            return await _context.Pacientes
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new PacienteDto
                {
                    Id = p.Id,
                    Nome = p.Nome,
                    DataNascimento = p.DataNascimento,
                    Documento = p.Documento,
                    DataCriacao = p.DataCriacao,
                    MedicoId = p.MedicoId,
                    MedicoNome = p.Medico != null ? p.Medico.Nome : null,
                    MedicoCRM = p.Medico != null ? p.Medico.CRM : null,
                    MedicoEspecialidade = p.Medico != null ? p.Medico.Especialidade : null
                })
                .FirstOrDefaultAsync();
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
