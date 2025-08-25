using Microsoft.EntityFrameworkCore;
using MobileMed.Api.Core.Application.DTOs;
using MobileMed.Api.Core.Application.DTOs.Auth;
using MobileMed.Api.Core.Application.DTOs.Admin;
using MobileMed.Api.Core.Application.Services;
using MobileMed.Api.Core.Domain.Enums;
using MobileMed.Api.Infrastructure.Data;
using MobileMed.Api.Infrastructure.Middleware;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

// Configurar o Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("../log/mobilemed-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework
builder.Services.AddDbContext<MobileMedDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services
builder.Services.AddScoped<PacienteService>();
builder.Services.AddScoped<ExameService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AdminService>();

// Add Serilog
builder.Host.UseSerilog();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Key"] ?? "thisIsAVeryStrongAndSecureSecretKeyForJWTAuthentication"; // Use a strong, secure key in production
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddAuthorization(); // Add Authorization services

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5005",
            "http://127.0.0.1:5005",
            "http://0.0.0.0:5005",
            "http://192.168.15.119:5005"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

builder.WebHost.UseUrls("http://0.0.0.0:5000"); // Configure Kestrel to listen on all interfaces

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthentication(); // Use Authentication middleware
app.UseMiddleware<TokenBlacklistMiddleware>(); // Use Token Blacklist middleware
app.UseAuthorization();   // Use Authorization middleware

// Endpoints para Pacientes
app.MapPost("/pacientes", async (CreatePacienteDto createPacienteDto, PacienteService pacienteService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Iniciando criação de paciente: {Nome}, Documento: {Documento}", createPacienteDto.Nome, createPacienteDto.Documento);
        var paciente = await pacienteService.CreatePacienteAsync(createPacienteDto);
        logger.LogInformation("Paciente criado com sucesso: {Id}", paciente.Id);
        return Results.Created($"/pacientes/{paciente.Id}", paciente);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Tentativa de criação de paciente com documento duplicado: {Documento}. Erro: {Message}", createPacienteDto.Documento, ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
});

app.MapGet("/pacientes", async (PacienteService pacienteService, int page, int pageSize, ILogger<Program> logger) =>
{
    logger.LogInformation("Listando pacientes - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
    var pacientes = await pacienteService.GetPacientesAsync(page, pageSize);
    logger.LogInformation("Listagem de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Count);
    return Results.Ok(pacientes);
});

app.MapPut("/pacientes/{id:guid}", async (Guid id, UpdatePacienteDto updatePacienteDto, PacienteService pacienteService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Iniciando atualização de paciente com ID: {Id}", id);
        var paciente = await pacienteService.UpdatePacienteAsync(id, updatePacienteDto);
        if (paciente == null)
        {
            logger.LogWarning("Paciente com ID: {Id} não encontrado para atualização.", id);
            return Results.NotFound(new { Message = $"Paciente com ID {id} não encontrado." });
        }
        logger.LogInformation("Paciente com ID: {Id} atualizado com sucesso.", id);
        return Results.Ok(paciente);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro ao atualizar paciente com ID: {Id}. Erro: {Message}", id, ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
});

app.MapDelete("/pacientes/{id:guid}", async (Guid id, PacienteService pacienteService, ILogger<Program> logger) =>
{
    logger.LogInformation("Iniciando exclusão de paciente com ID: {Id}", id);
    var result = await pacienteService.DeletePacienteAsync(id);
    if (!result)
    {
        logger.LogWarning("Paciente com ID: {Id} não encontrado para exclusão.", id);
        return Results.NotFound(new { Message = $"Paciente com ID {id} não encontrado." });
    }
    logger.LogInformation("Paciente com ID: {Id} excluído com sucesso.", id);
    return Results.NoContent();
});

// Endpoints para Exames
app.MapPost("/exames", async (CreateExameDto createExameDto, ExameService exameService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Iniciando criação de exame para paciente: {PacienteId}, IdempotencyKey: {IdempotencyKey}", createExameDto.PacienteId, createExameDto.IdempotencyKey);
        var exame = await exameService.CreateExameAsync(createExameDto);
        logger.LogInformation("Exame criado com sucesso: {Id}", exame.Id);
        return Results.Created($"/exames/{exame.Id}", exame);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro ao criar exame. Erro: {Message}", ex.Message);
        return Results.BadRequest(new { Message = ex.Message });
    }
});

app.MapGet("/exames", async (ExameService exameService, int page, int pageSize, ILogger<Program> logger) =>
{
    logger.LogInformation("Listando exames - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
    var exames = await exameService.GetExamesAsync(page, pageSize);
    logger.LogInformation("Listagem de exames concluída. Número de exames retornados: {Count}", exames.Count);
    return Results.Ok(exames);
});

app.MapPut("/exames/{id:guid}", async (Guid id, UpdateExameDto updateExameDto, ExameService exameService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Iniciando atualização de exame com ID: {Id}", id);
        var exame = await exameService.UpdateExameAsync(id, updateExameDto);
        if (exame == null)
        {
            logger.LogWarning("Exame com ID: {Id} não encontrado para atualização.", id);
            return Results.NotFound(new { Message = $"Exame com ID {id} não encontrado." });
        }
        logger.LogInformation("Exame com ID: {Id} atualizado com sucesso.", id);
        return Results.Ok(exame);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro ao atualizar exame com ID: {Id}. Erro: {Message}", id, ex.Message);
        return Results.BadRequest(new { Message = ex.Message });
    }
});

app.MapDelete("/exames/{id:guid}", async (Guid id, ExameService exameService, ILogger<Program> logger) =>
{
    logger.LogInformation("Iniciando exclusão de exame com ID: {Id}", id);
    var result = await exameService.DeleteExameAsync(id);
    if (!result)
    {
        logger.LogWarning("Exame com ID: {Id} não encontrado para exclusão.", id);
        return Results.NotFound(new { Message = $"Exame com ID {id} não encontrado." });
    }
    logger.LogInformation("Exame com ID: {Id} excluído com sucesso.", id);
    return Results.NoContent();
});

// Authentication Endpoints
app.MapPost("/auth/register", async (LoginRequestDto registerDto, UserService userService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Attempting to register user: {Username}", registerDto.Username);
        var user = await userService.CreateUser(registerDto.Username, registerDto.Password);
        logger.LogInformation("Usuário {Username} registrado com sucesso.", user.Username);
        return Results.Created($"/auth/register/{user.Id}", new { Message = "Usuário registrado com sucesso." });
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Failed to register user {Username}. Error: {Message}", registerDto.Username, ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An unexpected error occurred during user registration for {Username}.", registerDto.Username);
        return Results.Problem("An unexpected error occurred during registration.");
    }
});

app.MapPost("/auth/login", async (LoginRequestDto loginDto, AuthService authService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Tentativa de login para usuário: {Username}", loginDto.Username);
        
        var result = await authService.LoginAsync(loginDto.Username, loginDto.Password);
        
        if (result == null)
        {
            logger.LogWarning("Falha na autenticação para usuário: {Username}", loginDto.Username);
            return Results.Unauthorized();
        }

        logger.LogInformation("Usuário {Username} logado com sucesso", loginDto.Username);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado durante login para usuário: {Username}", loginDto.Username);
        return Results.Problem("Erro inesperado durante o login.");
    }
});

app.MapPost("/auth/refresh", async (RefreshTokenRequestDto refreshDto, AuthService authService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Tentativa de refresh token");
        
        var result = await authService.RefreshTokenAsync(refreshDto.RefreshToken);
        
        if (result == null)
        {
            logger.LogWarning("Refresh token inválido ou expirado");
            return Results.Unauthorized();
        }

        logger.LogInformation("Refresh token bem-sucedido");
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado durante refresh token");
        return Results.Problem("Erro inesperado durante refresh do token.");
    }
});

app.MapPost("/auth/logout", async (HttpContext context, AuthService authService, ILogger<Program> logger) =>
{
    try
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
        
        if (string.IsNullOrEmpty(token))
        {
            return Results.BadRequest("Token não fornecido");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        var tokenId = jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;

        if (string.IsNullOrEmpty(tokenId))
        {
            return Results.BadRequest("Token inválido");
        }

        var result = await authService.LogoutAsync(tokenId);
        
        if (result)
        {
            logger.LogInformation("Logout realizado com sucesso para token: {TokenId}", tokenId);
            return Results.Ok(new { Message = "Logout realizado com sucesso" });
        }
        
        return Results.Problem("Erro durante logout");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado durante logout");
        return Results.Problem("Erro inesperado durante logout.");
    }
}).RequireAuthorization();

// Endpoints Administrativos (requer perfil Administrador)
app.MapPost("/admin/usuarios", async (CreateUserDto createUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Criando usuário via admin: {Username}", createUserDto.Username);
        var user = await adminService.CreateUserAsync(createUserDto);
        logger.LogInformation("Usuário criado com sucesso via admin: {Id}", user.Id);
        return Results.Created($"/admin/usuarios/{user.Id}", user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao criar usuário: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar usuário");
        return Results.Problem("Erro inesperado ao criar usuário.");
    }
}).RequireAuthorization();

app.MapGet("/admin/usuarios", async (AdminService adminService, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Listando usuários via admin - Página: {Page}, Tamanho: {PageSize}", page, pageSize);
        var users = await adminService.GetUsersAsync(page, pageSize);
        logger.LogInformation("Listagem de usuários concluída. Usuários retornados: {Count}", users.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar usuários");
        return Results.Problem("Erro inesperado ao listar usuários.");
    }
}).RequireAuthorization();

app.MapGet("/admin/usuarios/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        var user = await adminService.GetUserByIdAsync(id);
        if (user == null)
        {
            logger.LogWarning("Usuário não encontrado: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        return Results.Ok(user);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar usuário: {Id}", id);
        return Results.Problem("Erro inesperado ao buscar usuário.");
    }
}).RequireAuthorization();

app.MapPut("/admin/usuarios/{id:guid}", async (Guid id, UpdateUserDto updateUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Atualizando usuário via admin: {Id}", id);
        var user = await adminService.UpdateUserAsync(id, updateUserDto);
        if (user == null)
        {
            logger.LogWarning("Usuário não encontrado para atualização: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário atualizado com sucesso via admin: {Id}", id);
        return Results.Ok(user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao atualizar usuário: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar usuário: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar usuário.");
    }
}).RequireAuthorization();

app.MapDelete("/admin/usuarios/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Desativando usuário via admin: {Id}", id);
        var result = await adminService.DeactivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("Usuário não encontrado para desativação: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário desativado com sucesso via admin: {Id}", id);
        return Results.Ok(new { Message = "Usuário desativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao desativar usuário: {Id}", id);
        return Results.Problem("Erro inesperado ao desativar usuário.");
    }
}).RequireAuthorization();

app.MapPatch("/admin/usuarios/{id:guid}/ativar", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Ativando usuário via admin: {Id}", id);
        var result = await adminService.ActivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("Usuário não encontrado para ativação: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário ativado com sucesso via admin: {Id}", id);
        return Results.Ok(new { Message = "Usuário ativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao ativar usuário: {Id}", id);
        return Results.Problem("Erro inesperado ao ativar usuário.");
    }
}).RequireAuthorization();

// Endpoints de Métricas
app.MapGet("/admin/metrics", async (AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado às métricas administrativas");
            return Results.Forbid();
        }

        logger.LogInformation("Gerando métricas administrativas");
        var metrics = await adminService.GetAdminMetricsAsync();
        return Results.Ok(metrics);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao gerar métricas administrativas");
        return Results.Problem("Erro inesperado ao gerar métricas.");
    }
}).RequireAuthorization();

app.MapGet("/medico/metrics", async (AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é médico ou administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Results.BadRequest("ID do usuário inválido");
        }

        if (userRole != UserRole.Medico.ToString() && userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso não autorizado às métricas de médico");
            return Results.Forbid();
        }

        logger.LogInformation("Gerando métricas para médico: {UserId}", userGuid);
        var metrics = await adminService.GetMedicoMetricsAsync(userGuid);
        return Results.Ok(metrics);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao gerar métricas de médico: {Message}", ex.Message);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao gerar métricas de médico");
        return Results.Problem("Erro inesperado ao gerar métricas.");
    }
}).RequireAuthorization();

app.Run();
