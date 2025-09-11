using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;

namespace HealthCore.Api.Core.Application.Services
{
    public class MedicoService(HealthCoreDbContext context, ILogger<MedicoService> logger)
    {
        private readonly HealthCoreDbContext _context = context;
        private readonly ILogger<MedicoService> _logger = logger;

        public async Task<MedicoDto> CreateMedicoAsync(CreateMedicoDto createMedicoDto)
        {
            _logger.LogInformation("Iniciando criação de médico - Documento: {Documento}, CRM: {CRM}, Username: {Username}", 
                createMedicoDto.Documento, createMedicoDto.CRM, createMedicoDto.Username);

            // Verificar se já existe um médico com o mesmo documento
            var medicoExistente = await _context.Medicos
                .FirstOrDefaultAsync(m => m.Documento == createMedicoDto.Documento);
                
            if (medicoExistente != null)
            {
                _logger.LogWarning("Tentativa de criar médico com documento já existente: {Documento}", createMedicoDto.Documento);
                throw new InvalidOperationException("Já existe um médico cadastrado com este documento.");
            }

            // Verificar se já existe um médico com o mesmo CRM
            var medicoComMesmoCRM = await _context.Medicos
                .FirstOrDefaultAsync(m => m.CRM == createMedicoDto.CRM);
                
            if (medicoComMesmoCRM != null)
            {
                _logger.LogWarning("Tentativa de criar médico com CRM já existente: {CRM}", createMedicoDto.CRM);
                throw new InvalidOperationException("Já existe um médico cadastrado com este CRM.");
            }

            // Verificar se já existe um usuário com o mesmo username
            var usuarioExistente = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == createMedicoDto.Username);
                
            if (usuarioExistente != null)
            {
                _logger.LogWarning("Tentativa de criar médico com username já existente: {Username}. Usuário existente - ID: {UserId}, Role: {Role}", 
                    createMedicoDto.Username, usuarioExistente.Id, usuarioExistente.Role);
                throw new InvalidOperationException("Já existe um usuário cadastrado com este username.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Criar o usuário primeiro
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = createMedicoDto.Username,
                    Role = UserRole.Medico,
                    IsActive = createMedicoDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };
                
                user.SetPassword(createMedicoDto.Password);
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Criar o médico
                var medico = new Medico
                {
                    UserId = user.Id,
                    Nome = createMedicoDto.Nome,
                    Documento = createMedicoDto.Documento,
                    DataNascimento = createMedicoDto.DataNascimento,
                    Telefone = createMedicoDto.Telefone ?? string.Empty,
                    Email = createMedicoDto.Email ?? string.Empty,
                    Endereco = createMedicoDto.Endereco ?? string.Empty,
                    CRM = createMedicoDto.CRM,
                    Especialidade = createMedicoDto.Especialidade ?? string.Empty,
                    DataCriacao = DateTime.UtcNow
                };

                _context.Medicos.Add(medico);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return new MedicoDto
                {
                    Id = medico.Id,
                    UserId = medico.UserId,
                    Nome = medico.Nome,
                    Documento = medico.Documento,
                    DataNascimento = medico.DataNascimento,
                    Telefone = medico.Telefone,
                    Email = medico.Email,
                    Endereco = medico.Endereco,
                    CRM = medico.CRM,
                    Especialidade = medico.Especialidade,
                    DataCriacao = medico.DataCriacao,
                    Username = user.Username,
                    IsActive = user.IsActive,
                    UserCreatedAt = user.CreatedAt
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PagedResponseDto<MedicoDto>> GetMedicosAsync(int page, int pageSize)
        {
            _logger.LogInformation("Listando médicos - Página: {Page}, Tamanho: {PageSize}", page, pageSize);
            
            // Calcular o total de médicos
            var total = await _context.Medicos.CountAsync();
            _logger.LogInformation("Total de médicos encontrados: {Total}", total);
            
            // Obter os médicos paginados com dados do usuário
            var medicos = await _context.Medicos
                .Include(m => m.User)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Converter para DTOs
            var medicoDtos = medicos.Select(m => new MedicoDto
            {
                Id = m.Id,
                UserId = m.UserId,
                Nome = m.Nome,
                Documento = m.Documento,
                DataNascimento = m.DataNascimento,
                Telefone = m.Telefone,
                Email = m.Email,
                Endereco = m.Endereco,
                CRM = m.CRM,
                Especialidade = m.Especialidade,
                DataCriacao = m.DataCriacao,
                Username = m.User?.Username,
                IsActive = m.User?.IsActive ?? false,
                UserCreatedAt = m.User?.CreatedAt ?? DateTime.MinValue
            }).ToList();

            // Calcular total de páginas
            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            // Retornar resposta paginada
            return new PagedResponseDto<MedicoDto>
            {
                Data = medicoDtos,
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<MedicoDto?> GetMedicoByIdAsync(Guid id)
        {
            var medico = await _context.Medicos
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medico == null)
            {
                return null;
            }

            return new MedicoDto
            {
                Id = medico.Id,
                UserId = medico.UserId,
                Nome = medico.Nome,
                Documento = medico.Documento,
                DataNascimento = medico.DataNascimento,
                Telefone = medico.Telefone,
                Email = medico.Email,
                Endereco = medico.Endereco,
                CRM = medico.CRM,
                Especialidade = medico.Especialidade,
                DataCriacao = medico.DataCriacao,
                Username = medico.User?.Username,
                IsActive = medico.User?.IsActive ?? false,
                UserCreatedAt = medico.User?.CreatedAt ?? DateTime.MinValue
            };
        }

        public async Task<MedicoDto?> UpdateMedicoAsync(Guid id, UpdateMedicoDto updateMedicoDto)
        {
            var medico = await _context.Medicos
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medico == null)
            {
                return null; // Médico não encontrado
            }

            // Verificar se o novo documento já existe para outro médico
            var medicoComMesmoDocumento = await _context.Medicos
                .FirstOrDefaultAsync(m => m.Documento == updateMedicoDto.Documento && m.Id != id);

            if (medicoComMesmoDocumento != null)
            {
                throw new InvalidOperationException("Já existe outro médico cadastrado com este documento.");
            }

            // Verificar se o novo CRM já existe para outro médico
            var medicoComMesmoCRM = await _context.Medicos
                .FirstOrDefaultAsync(m => m.CRM == updateMedicoDto.CRM && m.Id != id);

            if (medicoComMesmoCRM != null)
            {
                throw new InvalidOperationException("Já existe outro médico cadastrado com este CRM.");
            }

            // Verificar se o novo username já existe para outro usuário
            if (!string.IsNullOrEmpty(updateMedicoDto.Username))
            {
                var usuarioComMesmoUsername = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == updateMedicoDto.Username && u.Id != medico.UserId);

                if (usuarioComMesmoUsername != null)
                {
                    throw new InvalidOperationException("Já existe outro usuário cadastrado com este username.");
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Atualizar dados do médico
                medico.Nome = updateMedicoDto.Nome;
                medico.Documento = updateMedicoDto.Documento;
                medico.DataNascimento = updateMedicoDto.DataNascimento;
                medico.Telefone = updateMedicoDto.Telefone ?? string.Empty;
                medico.Email = updateMedicoDto.Email ?? string.Empty;
                medico.Endereco = updateMedicoDto.Endereco ?? string.Empty;
                medico.CRM = updateMedicoDto.CRM;
                medico.Especialidade = updateMedicoDto.Especialidade ?? string.Empty;

                // Atualizar dados do usuário se fornecidos
                if (medico.User != null)
                {
                    if (!string.IsNullOrEmpty(updateMedicoDto.Username))
                    {
                        medico.User.Username = updateMedicoDto.Username;
                    }
                    
                    if (!string.IsNullOrEmpty(updateMedicoDto.Password))
                    {
                        medico.User.SetPassword(updateMedicoDto.Password);
                    }
                    
                    if (updateMedicoDto.IsActive.HasValue)
                    {
                        medico.User.IsActive = updateMedicoDto.IsActive.Value;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new MedicoDto
                {
                    Id = medico.Id,
                    UserId = medico.UserId,
                    Nome = medico.Nome,
                    Documento = medico.Documento,
                    DataNascimento = medico.DataNascimento,
                    Telefone = medico.Telefone,
                    Email = medico.Email,
                    Endereco = medico.Endereco,
                    CRM = medico.CRM,
                    Especialidade = medico.Especialidade,
                    DataCriacao = medico.DataCriacao,
                    Username = medico.User?.Username,
                    IsActive = medico.User?.IsActive ?? false,
                    UserCreatedAt = medico.User?.CreatedAt ?? DateTime.MinValue
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteMedicoAsync(Guid id)
        {
            var medico = await _context.Medicos
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.Id == id);
                
            if (medico == null)
            {
                return false; // Médico não encontrado
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Remover o médico
                _context.Medicos.Remove(medico);
                
                // Remover o usuário associado
                if (medico.User != null)
                {
                    _context.Users.Remove(medico.User);
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}