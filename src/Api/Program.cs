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
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;

// Configurar o Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("../log/mobilemed-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add model validation
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<MobileMedDbContext>("database")
    .AddCheck("filesystem", () =>
    {
        try
        {
            var logPath = Path.Combine(Directory.GetCurrentDirectory(), "../log");
            if (!Directory.Exists(logPath))
            {
                Directory.CreateDirectory(logPath);
            }
            
            var testFile = Path.Combine(logPath, "health-check.tmp");
            File.WriteAllText(testFile, DateTime.UtcNow.ToString());
            File.Delete(testFile);
            
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Filesystem is accessible");
        }
        catch (Exception ex)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Filesystem check failed", ex);
        }
    })
    .AddCheck("memory", () =>
    {
        var gc = GC.GetTotalMemory(false);
        var workingSet = Environment.WorkingSet;
        
        if (workingSet > 1024 * 1024 * 1024) // 1GB
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded($"High memory usage: {workingSet / 1024 / 1024} MB");
        }
        
        return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy($"Memory usage: {workingSet / 1024 / 1024} MB");
    });

// Add Entity Framework
builder.Services.AddDbContext<MobileMedDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services
builder.Services.AddScoped<PacienteService>();
builder.Services.AddScoped<ExameService>();
builder.Services.AddScoped<MedicoService>();
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
    
    // Política mais flexível para desenvolvimento distribuído
    options.AddPolicy("AllowDevelopment", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;
            
            // Permitir localhost e 127.0.0.1
            if (origin.StartsWith("http://localhost:") || origin.StartsWith("http://127.0.0.1:"))
                return true;
            
            // Permitir HTTPS localhost
            if (origin.StartsWith("https://localhost:") || origin.StartsWith("https://127.0.0.1:"))
                return true;
            
            // Permitir ngrok URLs
            if (origin.Contains(".ngrok-free.app") || origin.Contains(".ngrok.io") || origin.Contains(".ngrok.app"))
                return true;
            
            // Permitir IPs da rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
            var uri = new Uri(origin);
            var host = uri.Host;
            
            if (host.StartsWith("192.168.") || 
                host.StartsWith("10.") || 
                (host.StartsWith("172.") && 
                 int.TryParse(host.Split('.')[1], out int second) && 
                 second >= 16 && second <= 31))
            {
                return true;
            }
            
            return false;
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

builder.WebHost.UseUrls("http://0.0.0.0:5000"); // Configure Kestrel to listen on all interfaces

var app = builder.Build();

// Helper method for model validation
static (bool IsValid, IResult? ErrorResult) ValidateModel<T>(T model) where T : class
{
    var context = new ValidationContext(model);
    var results = new List<ValidationResult>();
    
    if (!Validator.TryValidateObject(model, context, results, true))
    {
        var errors = results.Select(r => r.ErrorMessage).ToList();
        return (false, Results.BadRequest(new { Message = "Dados inválidos", Errors = errors }));
    }
    
    return (true, null);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowDevelopment"); // Política flexível para desenvolvimento
}
else
{
    app.UseCors("AllowFrontend"); // Política restrita para produção
}

app.UseAuthentication(); // Use Authentication middleware
app.UseMiddleware<TokenBlacklistMiddleware>(); // Use Token Blacklist middleware
app.UseAuthorization();   // Use Authorization middleware

// Health Check Endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        
        var response = new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            duration = report.TotalDuration,
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                duration = entry.Value.Duration,
                description = entry.Value.Description,
                exception = entry.Value.Exception?.Message
            }),
            system = new
            {
                environment = app.Environment.EnvironmentName,
                machineName = Environment.MachineName,
                osVersion = Environment.OSVersion.ToString(),
                processId = Environment.ProcessId,
                workingSet = $"{Environment.WorkingSet / 1024 / 1024} MB",
                gcMemory = $"{GC.GetTotalMemory(false) / 1024 / 1024} MB",
                uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime()
            }
        };
        
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
            WriteIndented = true
        }));
    }
});

// Simple health check endpoint for load balancers
app.MapGet("/health/ready", () => Results.Ok(new { status = "ready", timestamp = DateTime.UtcNow }));

// Liveness probe endpoint
app.MapGet("/health/live", () => Results.Ok(new { status = "alive", timestamp = DateTime.UtcNow }));

// Detailed system info endpoint (for monitoring tools)
app.MapGet("/health/info", () =>
{
    var process = Process.GetCurrentProcess();
    var startTime = process.StartTime.ToUniversalTime();
    
    return Results.Ok(new
    {
        application = new
        {
            name = "MobileMed API",
            version = "1.0.0",
            environment = app.Environment.EnvironmentName,
            startTime = startTime,
            uptime = DateTime.UtcNow - startTime
        },
        system = new
        {
            machineName = Environment.MachineName,
            osVersion = Environment.OSVersion.ToString(),
            processorCount = Environment.ProcessorCount,
            is64BitOperatingSystem = Environment.Is64BitOperatingSystem,
            is64BitProcess = Environment.Is64BitProcess,
            clrVersion = Environment.Version.ToString()
        },
        process = new
        {
            id = Environment.ProcessId,
            workingSet = $"{Environment.WorkingSet / 1024 / 1024} MB",
            gcMemory = $"{GC.GetTotalMemory(false) / 1024 / 1024} MB",
            threadCount = process.Threads.Count,
            handleCount = process.HandleCount
        },
        timestamp = DateTime.UtcNow
    });
});

// Endpoints para Pacientes
app.MapPost("/pacientes", async (CreatePacienteDto createPacienteDto, PacienteService pacienteService, ILogger<Program> logger) =>
{
    // Validar modelo
    var (isValid, errorResult) = ValidateModel(createPacienteDto);
    if (!isValid)
        return errorResult!;

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

app.MapGet("/pacientes", async (PacienteService pacienteService, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    logger.LogInformation("Listando pacientes - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
    var pacientes = await pacienteService.GetPacientesAsync(page, pageSize);
    logger.LogInformation("Listagem de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Data.Count);
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
    // Validar modelo
    var (isValid, errorResult) = ValidateModel(createExameDto);
    if (!isValid)
        return errorResult!;

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
    catch (ArgumentException ex)
    {
        logger.LogWarning("Modalidade inválida no exame. Erro: {Message}", ex.Message);
        return Results.BadRequest(new { Message = ex.Message });
    }
});

app.MapGet("/exames", async (ExameService exameService, int page = 1, int pageSize = 10, string? modalidade = null, Guid? pacienteId = null, DateTime? dataInicio = null, DateTime? dataFim = null, ILogger<Program> logger = null!) =>
{
    logger.LogInformation("Listando exames - Página: {Page}, Tamanho da página: {PageSize}, Modalidade: {Modalidade}, PacienteId: {PacienteId}", page, pageSize, modalidade, pacienteId);
    var exames = await exameService.GetExamesAsync(page, pageSize, modalidade, pacienteId, dataInicio, dataFim);
    logger.LogInformation("Listagem de exames concluída. Número de exames retornados: {Count}", exames.Data.Count);
    return Results.Ok(exames);
});

app.MapGet("/exames/{id:guid}", async (Guid id, ExameService exameService, ILogger<Program> logger) =>
{
    logger.LogInformation("Buscando exame com ID: {Id}", id);
    var exame = await exameService.GetExameByIdAsync(id);
    if (exame == null)
    {
        logger.LogWarning("Exame com ID: {Id} não encontrado.", id);
        return Results.NotFound(new { Message = $"Exame com ID {id} não encontrado." });
    }
    logger.LogInformation("Exame encontrado: {Id}", id);
    return Results.Ok(exame);
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

// Endpoint para listar modalidades disponíveis
app.MapGet("/exames/modalidades", (ILogger<Program> logger) =>
{
    logger.LogInformation("Listando modalidades de exames disponíveis");
    var modalidades = Enum.GetValues<MobileMed.Api.Core.Domain.Enums.ModalidadeExame>()
        .Select(m => new { 
            Value = m.ToString(), 
            Description = GetModalidadeDescription(m) 
        })
        .ToList();
    
    return Results.Ok(modalidades);
});

static string GetModalidadeDescription(MobileMed.Api.Core.Domain.Enums.ModalidadeExame modalidade)
{
    return modalidade switch
    {
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.CR => "Computed Radiography",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.CT => "Computed Tomography",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.DX => "Digital Radiography",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.MG => "Mammography",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.MR => "Magnetic Resonance",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.NM => "Nuclear Medicine",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.OT => "Other",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.PT => "Positron Emission Tomography (PET)",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.RF => "Radio Fluoroscopy",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.US => "Ultrasound",
        MobileMed.Api.Core.Domain.Enums.ModalidadeExame.XA => "X-Ray Angiography",
        _ => modalidade.ToString()
    };
}

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

// Endpoints de Médicos
app.MapPost("/medicos", async (CreateMedicoDto createMedicoDto, MedicoService medicoService, ILogger<Program> logger) =>
{
    if (!ModelState.IsValid(createMedicoDto))
    {
        return Results.BadRequest("Dados inválidos fornecidos.");
    }

    try
    {
        logger.LogInformation("Criando médico: {Nome}", createMedicoDto.Nome);
        var medico = await medicoService.CreateMedicoAsync(createMedicoDto);
        logger.LogInformation("Médico criado com sucesso: {Id}", medico.Id);
        return Results.Created($"/medicos/{medico.Id}", medico);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao criar médico: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar médico");
        return Results.Problem("Erro inesperado ao criar médico.");
    }
}).RequireAuthorization();

app.MapGet("/medicos", async (MedicoService medicoService, ILogger<Program> logger, int page = 1, int pageSize = 7) =>
{
    try
    {
        logger.LogInformation("Listando médicos - Página: {Page}, Tamanho: {PageSize}", page, pageSize);
        var medicos = await medicoService.GetMedicosAsync(page, pageSize);
        logger.LogInformation("Listagem de médicos concluída. Médicos retornados: {Count}", medicos.Count);
        return Results.Ok(medicos);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar médicos");
        return Results.Problem("Erro inesperado ao listar médicos.");
    }
}).RequireAuthorization();

app.MapGet("/medicos/{id:guid}", async (Guid id, MedicoService medicoService, ILogger<Program> logger) =>
{
    try
    {
        var medico = await medicoService.GetMedicoByIdAsync(id);
        if (medico == null)
        {
            logger.LogWarning("Médico não encontrado: {Id}", id);
            return Results.NotFound(new { Message = $"Médico com ID {id} não encontrado." });
        }

        logger.LogInformation("Médico encontrado: {Id}", id);
        return Results.Ok(medico);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar médico: {Id}", id);
        return Results.Problem("Erro inesperado ao buscar médico.");
    }
}).RequireAuthorization();

app.MapPut("/medicos/{id:guid}", async (Guid id, UpdateMedicoDto updateMedicoDto, MedicoService medicoService, ILogger<Program> logger) =>
{
    if (!ModelState.IsValid(updateMedicoDto))
    {
        return Results.BadRequest("Dados inválidos fornecidos.");
    }

    try
    {
        logger.LogInformation("Atualizando médico: {Id}", id);
        var medico = await medicoService.UpdateMedicoAsync(id, updateMedicoDto);
        if (medico == null)
        {
            logger.LogWarning("Médico não encontrado para atualização: {Id}", id);
            return Results.NotFound(new { Message = $"Médico com ID {id} não encontrado." });
        }

        logger.LogInformation("Médico atualizado com sucesso: {Id}", id);
        return Results.Ok(medico);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao atualizar médico {Id}: {Message}", id, ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar médico: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar médico.");
    }
}).RequireAuthorization();

app.MapDelete("/medicos/{id:guid}", async (Guid id, MedicoService medicoService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Excluindo médico: {Id}", id);
        var success = await medicoService.DeleteMedicoAsync(id);
        if (!success)
        {
            logger.LogWarning("Médico não encontrado para exclusão: {Id}", id);
            return Results.NotFound(new { Message = $"Médico com ID {id} não encontrado." });
        }

        logger.LogInformation("Médico excluído com sucesso: {Id}", id);
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao excluir médico: {Id}", id);
        return Results.Problem("Erro inesperado ao excluir médico.");
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
