using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Application.DTOs.Admin;
using MobileMed.Api.Core.Domain.Entities;
using MobileMed.Api.Core.Domain.Enums;
using MobileMed.Api.Infrastructure.Data;

namespace MobileMed.Api.Core.Application.Services
{
    public class AdminService
    {
        private readonly MobileMedDbContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(MobileMedDbContext context, ILogger<AdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            try
            {
                _logger.LogInformation("Criando usuário: {Username} com perfil: {Role}", createUserDto.Username, createUserDto.Role);

                // Verificar se username já existe
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == createUserDto.Username);

                if (existingUser != null)
                {
                    throw new InvalidOperationException($"Usuário com username '{createUserDto.Username}' já existe.");
                }

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = createUserDto.Username,
                    Role = createUserDto.Role,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                user.SetPassword(createUserDto.Password);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuário criado com sucesso: {Id}", user.Id);

                return new UserResponseDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar usuário: {Username}", createUserDto.Username);
                throw;
            }
        }

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

        public async Task<UserResponseDto?> GetUserByIdAsync(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new UserResponseDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        Role = u.Role,
                        IsActive = u.IsActive,
                        CreatedAt = u.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar usuário: {Id}", id);
                throw;
            }
        }

        public async Task<UserResponseDto?> UpdateUserAsync(Guid id, UpdateUserDto updateUserDto)
        {
            try
            {
                _logger.LogInformation("Atualizando usuário: {Id}", id);

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return null;
                }

                // Verificar se novo username já existe (se fornecido)
                if (!string.IsNullOrEmpty(updateUserDto.Username) && updateUserDto.Username != user.Username)
                {
                    var existingUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.Username == updateUserDto.Username && u.Id != id);

                    if (existingUser != null)
                    {
                        throw new InvalidOperationException($"Usuário com username '{updateUserDto.Username}' já existe.");
                    }

                    user.Username = updateUserDto.Username;
                }

                if (!string.IsNullOrEmpty(updateUserDto.Password))
                {
                    user.SetPassword(updateUserDto.Password);
                }

                if (updateUserDto.Role.HasValue)
                {
                    user.Role = updateUserDto.Role.Value;
                }

                if (updateUserDto.IsActive.HasValue)
                {
                    user.IsActive = updateUserDto.IsActive.Value;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuário atualizado com sucesso: {Id}", id);

                return new UserResponseDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar usuário: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeactivateUserAsync(Guid id)
        {
            try
            {
                _logger.LogInformation("Desativando usuário: {Id}", id);

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return false;
                }

                user.IsActive = false;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuário desativado com sucesso: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao desativar usuário: {Id}", id);
                throw;
            }
        }

        public async Task<bool> ActivateUserAsync(Guid id)
        {
            try
            {
                _logger.LogInformation("Ativando usuário: {Id}", id);

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return false;
                }

                user.IsActive = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Usuário ativado com sucesso: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao ativar usuário: {Id}", id);
                throw;
            }
        }

        public async Task<AdminMetricsDto> GetAdminMetricsAsync()
        {
            try
            {
                _logger.LogInformation("Gerando métricas administrativas");

                var totalUsuarios = await _context.Users.CountAsync();
                var totalMedicos = await _context.Users.CountAsync(u => u.Role == UserRole.Medico);
                var totalAdministradores = await _context.Users.CountAsync(u => u.Role == UserRole.Administrador);
                var totalPacientes = await _context.Pacientes.CountAsync();
                var totalExames = await _context.Exames.CountAsync();

                // Pacientes por médico (simulado - seria necessário relacionamento real)
                var pacientesPorMedico = await _context.Users
                    .Where(u => u.Role == UserRole.Medico)
                    .Select(u => new PacientesPorMedicoDto
                    {
                        Medico = u.Username,
                        Pacientes = _context.Pacientes.Count() / Math.Max(_context.Users.Count(us => us.Role == UserRole.Medico), 1) // Distribuição simulada
                    })
                    .ToListAsync();

                // Crescimento da base de dados (últimos 6 meses)
                var crescimento = new List<CrescimentoDto>();
                for (int i = 5; i >= 0; i--)
                {
                    var dataInicio = DateTime.UtcNow.AddMonths(-i-1);
                    var dataFim = DateTime.UtcNow.AddMonths(-i);
                    
                    crescimento.Add(new CrescimentoDto
                    {
                        Periodo = dataFim.ToString("yyyy-MM"),
                        NovosUsuarios = await _context.Users.CountAsync(u => u.CreatedAt >= dataInicio && u.CreatedAt < dataFim),
                        NovosPacientes = await _context.Pacientes.CountAsync(p => p.DataCriacao >= dataInicio && p.DataCriacao < dataFim),
                        NovosExames = await _context.Exames.CountAsync(e => e.DataCriacao >= dataInicio && e.DataCriacao < dataFim)
                    });
                }

                // Exames por período (últimos 6 meses)
                var examesPorPeriodo = new List<ExamesPorPeriodoDto>();
                for (int i = 5; i >= 0; i--)
                {
                    var dataInicio = DateTime.UtcNow.AddMonths(-i-1);
                    var dataFim = DateTime.UtcNow.AddMonths(-i);
                    
                    examesPorPeriodo.Add(new ExamesPorPeriodoDto
                    {
                        Periodo = dataFim.ToString("yyyy-MM"),
                        Quantidade = await _context.Exames.CountAsync(e => e.DataCriacao >= dataInicio && e.DataCriacao < dataFim)
                    });
                }

                var metrics = new AdminMetricsDto
                {
                    TotalUsuarios = totalUsuarios,
                    TotalMedicos = totalMedicos,
                    TotalAdministradores = totalAdministradores,
                    TotalPacientes = totalPacientes,
                    TotalExames = totalExames,
                    PacientesPorMedico = pacientesPorMedico,
                    CrescimentoBaseDados = crescimento,
                    ExamesPorPeriodo = examesPorPeriodo
                };

                _logger.LogInformation("Métricas administrativas geradas com sucesso");
                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar métricas administrativas");
                throw;
            }
        }

        public async Task<MedicoMetricsDto> GetMedicoMetricsAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation("Gerando métricas para médico: {UserId}", userId);

                // Verificar se o usuário é médico
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.Role != UserRole.Medico)
                {
                    throw new InvalidOperationException("Usuário não é um médico válido.");
                }

                // Buscar o registro do médico na tabela Medicos
                var medico = await _context.Medicos.FirstOrDefaultAsync(m => m.UserId == userId);
                if (medico == null)
                {
                    throw new InvalidOperationException("Registro de médico não encontrado.");
                }

                // Contar apenas pacientes do médico logado
                var totalPacientes = await _context.Pacientes.CountAsync(p => p.MedicoId == medico.Id);
                
                // Contar apenas exames dos pacientes do médico logado
                var totalExames = await _context.Exames
                    .Where(e => _context.Pacientes.Any(p => p.Id == e.PacienteId && p.MedicoId == medico.Id))
                    .CountAsync();

                // Exames por paciente (apenas pacientes do médico)
                var examesPorPaciente = await _context.Pacientes
                    .Where(p => p.MedicoId == medico.Id)
                    .Select(p => new ExamesPorPacienteDto
                    {
                        Paciente = p.Nome,
                        Exames = _context.Exames.Count(e => e.PacienteId == p.Id)
                    })
                    .ToListAsync();

                // Modalidades mais utilizadas (apenas exames dos pacientes do médico)
                var modalidades = await _context.Exames
                    .Where(e => _context.Pacientes.Any(p => p.Id == e.PacienteId && p.MedicoId == medico.Id))
                    .GroupBy(e => e.Modalidade)
                    .Select(g => new ModalidadeDto
                    {
                        Modalidade = g.Key.ToString(),
                        Quantidade = g.Count()
                    })
                    .OrderByDescending(m => m.Quantidade)
                    .Take(5)
                    .ToListAsync();

                var metrics = new MedicoMetricsDto
                {
                    NumeroPacientes = totalPacientes,
                    TotalExames = totalExames,
                    ExamesPorPaciente = examesPorPaciente,
                    ModalidadesMaisUtilizadas = modalidades
                };

                _logger.LogInformation("Métricas do médico geradas com sucesso - Pacientes: {Pacientes}, Exames: {Exames}", totalPacientes, totalExames);
                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar métricas do médico: {UserId}", userId);
                throw;
            }
        }

        public async Task<PagedResponseDto<UserResponseDto>> SearchUsersByUsernameAsync(string? username, int page = 1, int pageSize = 10)
        {
            try
            {
                _logger.LogInformation("Buscando usuários por username: {Username} - Página: {Page}, Tamanho: {PageSize}", username, page, pageSize);

                // Criar query base
                var query = _context.Users.AsQueryable();
                
                // Filtrar por username se especificado
                if (!string.IsNullOrEmpty(username))
                {
                    query = query.Where(u => u.Username.Contains(username));
                }
                
                // Calcular o total de usuários (com filtro aplicado)
                var total = await query.CountAsync();
                
                // Obter os usuários paginados
                var users = await query
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

                // Calcular total de páginas
                var totalPages = (int)Math.Ceiling((double)total / pageSize);

                _logger.LogInformation("Busca de usuários concluída. Número de usuários retornados: {Count}", users.Count);

                // Retornar resposta paginada
                return new PagedResponseDto<UserResponseDto>
                {
                    Data = users,
                    Total = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar usuários por username");
                throw;
            }
        }
    }
}