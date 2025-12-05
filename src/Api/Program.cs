using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Application.DTOs.Auth;
using HealthCore.Api.Core.Application.DTOs.Admin;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Infrastructure.Middleware;
using Serilog;
using Serilog.Formatting.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;
using Microsoft.OpenApi.Models;

// Configurar o Serilog
var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

Log.Logger = new LoggerConfiguration()
    .Enrich.WithProperty("Application", "HealthCore.Api")
    .Enrich.WithProperty("Environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production")
    .Enrich.WithEnvironmentName()
    .WriteTo.Console()
    .WriteTo.File(
        path: "../log/healthcore-.log", 
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();

// Add Memory Cache
builder.Services.AddMemoryCache();

// Register Health Check services
builder.Services.AddScoped<HealthCore.Api.Infrastructure.HealthChecks.DatabasePerformanceHealthCheck>();

// Rate limiting removed - package not available
//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    // Adicione esta linha:
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HealthCore API", Version = "v1" });
    // ... outras configurações ...
});

// Add model validation
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<HealthCoreDbContext>(
        "database",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "db", "sql", "ready" })
    .AddCheck("filesystem", () =>
    {
        try
        {
            var logPath = Path.Combine(Directory.GetCurrentDirectory(), "log");
            if (!Directory.Exists(logPath))
            {
                Directory.CreateDirectory(logPath);
            }
            
            var testFile = Path.Combine(logPath, "health-check.tmp");
            File.WriteAllText(testFile, DateTime.UtcNow.ToString());
            File.Delete(testFile);
            
            // Verificar espaço em disco
            var drive = new DriveInfo(Path.GetPathRoot(Directory.GetCurrentDirectory())!);
            var freeSpaceGB = drive.AvailableFreeSpace / (1024.0 * 1024 * 1024);
            var minDiskSpaceGB = builder.Configuration.GetValue<double>("HealthChecks:MinDiskSpaceGB", 1.0);
            
            if (freeSpaceGB < minDiskSpaceGB)
            {
                return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded(
                    $"Low disk space: {freeSpaceGB:F2} GB available");
            }
            
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy(
                $"Filesystem accessible. Free space: {freeSpaceGB:F2} GB");
        }
        catch (Exception ex)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Filesystem check failed", ex);
        }
    }, tags: new[] { "filesystem", "ready" })
    .AddCheck("memory", () =>
    {
        var gc = GC.GetTotalMemory(false);
        var workingSet = Environment.WorkingSet;
        var maxMemoryMB = builder.Configuration.GetValue<long>("HealthChecks:MaxMemoryUsageMB", 512);
        var maxMemoryBytes = maxMemoryMB * 1024 * 1024;
        
        var workingSetMB = workingSet / 1024 / 1024;
        var gcMB = gc / 1024 / 1024;
        
        if (workingSet > maxMemoryBytes)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded(
                $"High memory usage: Working Set {workingSetMB} MB, GC {gcMB} MB");
        }
        
        return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy(
            $"Memory usage normal: Working Set {workingSetMB} MB, GC {gcMB} MB");
    }, tags: new[] { "memory", "live" })
    .AddCheck<HealthCore.Api.Infrastructure.HealthChecks.DatabasePerformanceHealthCheck>(
        "database-performance", 
        tags: new[] { "db", "performance", "ready" })
    .AddCheck("application-startup", () =>
    {
        var uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime();
        
        if (uptime.TotalSeconds < 30)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded(
                $"Application still warming up: {uptime.TotalSeconds:F0}s");
        }
        
        return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy(
            $"Application running: {uptime.TotalMinutes:F1} minutes");
    }, tags: new[] { "startup", "live" });

// Add Entity Framework
builder.Services.AddDbContext<HealthCoreDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services
builder.Services.AddScoped<PacienteService>();
builder.Services.AddScoped<ExameService>();
builder.Services.AddScoped<MedicoService>();
builder.Services.AddScoped<EspecialidadeService>();
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

// Configure CORS for Nginx Proxy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowProxy", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
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

// Configure PathBase for Nginx Proxy
app.UsePathBase("/healthcore-api");

// Configure the HTTP request pipeline.
// Habilitar Swagger em produção para facilitar testes e documentação
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/healthcore-api/swagger/v1/swagger.json", "HealthCore API V1");
    c.RoutePrefix = "swagger"; // Swagger disponível em /swagger
});

app.UseHttpsRedirection();

// Security headers (enable by config)
var enableSecurityHeaders = builder.Configuration.GetValue<bool>("Security:EnableSecurityHeaders", true);
if (enableSecurityHeaders)
{
    app.UseSecurityHeaders();
}

// Rate limiting removed - package not available

// Use CORS
app.UseCors("AllowProxy");

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

// Readiness probe endpoint (with database and filesystem checks)
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString().ToLowerInvariant(),
            timestamp = DateTime.UtcNow,
            duration = report.TotalDuration,
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString().ToLowerInvariant(),
                duration = entry.Value.Duration,
                description = entry.Value.Description
            })
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
});

// Liveness probe endpoint (minimal checks, always responsive)
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString().ToLowerInvariant(),
            timestamp = DateTime.UtcNow
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
});

// Detailed system info endpoint (for monitoring tools)
app.MapGet("/health/info", () =>
{
    var process = Process.GetCurrentProcess();
    var startTime = process.StartTime.ToUniversalTime();
    
    return Results.Ok(new
    {
        application = new
        {
            name = "HealthCore API",
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

app.MapGet("/pacientes", async (PacienteService pacienteService, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Listando pacientes - Página: {Page}, Tamanho da página: {PageSize}", page, pageSize);
        
        // Verificar o role do usuário logado
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        Guid? medicoId = null;
        
        // Se for médico, filtrar apenas seus pacientes
        if (userRole == UserRole.Medico.ToString() && !string.IsNullOrEmpty(userId))
        {
            // Buscar o ID do médico baseado no UserId
            using var scope = context.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
            
            var medico = await dbContext.Medicos
                .FirstOrDefaultAsync(m => m.UserId == Guid.Parse(userId));
                
            if (medico != null)
            {
                medicoId = medico.Id;
                logger.LogInformation("Filtrando pacientes para o médico: {MedicoId}", medicoId);
            }
        }
        
        var pacientes = await pacienteService.GetPacientesAsync(page, pageSize, medicoId);
        logger.LogInformation("Listagem de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Data.Count);
        return Results.Ok(pacientes);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar pacientes");
        return Results.Problem("Erro inesperado ao listar pacientes.");
    }
}).RequireAuthorization();

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

app.MapGet("/pacientes/{id:guid}", async (Guid id, PacienteService pacienteService, ILogger<Program> logger) =>
{
    logger.LogInformation("Buscando paciente com ID: {Id}", id);
    var paciente = await pacienteService.GetPacienteByIdAsync(id);
    if (paciente == null)
    {
        logger.LogWarning("Paciente com ID: {Id} não encontrado.", id);
        return Results.NotFound(new { Message = $"Paciente com ID {id} não encontrado." });
    }
    logger.LogInformation("Paciente encontrado: {Id}", id);
    return Results.Ok(paciente);
}).RequireAuthorization();

app.MapGet("/pacientes/search", async (PacienteService pacienteService, HttpContext context, ILogger<Program> logger, string? nome = null, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Buscando pacientes por nome: {Nome} - Página: {Page}, Tamanho: {PageSize}", nome, page, pageSize);
        
        // Verificar o role do usuário logado
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        Guid? medicoId = null;
        
        // Se for médico, filtrar apenas seus pacientes
        if (userRole == UserRole.Medico.ToString() && !string.IsNullOrEmpty(userId))
        {
            using var scope = context.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
            
            var medico = await dbContext.Medicos
                .FirstOrDefaultAsync(m => m.UserId == Guid.Parse(userId));
                
            if (medico != null)
            {
                medicoId = medico.Id;
                logger.LogInformation("Filtrando pacientes para o médico: {MedicoId}", medicoId);
            }
        }
        
        var pacientes = await pacienteService.SearchPacientesByNomeAsync(nome, page, pageSize, medicoId);
        logger.LogInformation("Busca de pacientes concluída. Número de pacientes retornados: {Count}", pacientes.Data.Count);
        return Results.Ok(pacientes);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar pacientes por nome");
        return Results.Problem("Erro inesperado ao buscar pacientes.");
    }
}).RequireAuthorization();

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

app.MapGet("/exames", async (HttpContext context, ExameService exameService, HealthCoreDbContext dbContext, int page = 1, int pageSize = 10, string? modalidade = null, Guid? pacienteId = null, DateTime? dataInicio = null, DateTime? dataFim = null, ILogger<Program> logger = null!) =>
{
    try
    {
        logger.LogInformation("Listando exames - Página: {Page}, Tamanho da página: {PageSize}, Modalidade: {Modalidade}, PacienteId: {PacienteId}", page, pageSize, modalidade, pacienteId);
        
        // Obter informações do usuário logado
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRoleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userRoleClaim))
        {
            logger.LogWarning("Usuário não autenticado tentando acessar exames");
            return Results.Unauthorized();
        }
        
        var userId = Guid.Parse(userIdClaim);
        var userRole = Enum.Parse<UserRole>(userRoleClaim);
        
        Guid? medicoId = null;
        
        // Se for médico, filtrar apenas exames dos seus pacientes
        if (userRole == UserRole.Medico)
        {
            var medico = await dbContext.Medicos.FirstOrDefaultAsync(m => m.UserId == userId);
            if (medico == null)
            {
                logger.LogWarning("Médico não encontrado para o usuário {UserId}", userId);
                return Results.NotFound(new { Message = "Médico não encontrado" });
            }
            medicoId = medico.Id;
            logger.LogInformation("Filtrando exames dos pacientes do médico {MedicoId}", medicoId);
        }
        else
        {
            logger.LogInformation("Usuário administrador - listando todos os exames");
        }
        
        var exames = await exameService.GetExamesAsync(page, pageSize, modalidade, pacienteId, dataInicio, dataFim, medicoId);
        logger.LogInformation("Listagem de exames concluída. Número de exames retornados: {Count}", exames.Data.Count);
        return Results.Ok(exames);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar exames");
        return Results.Problem("Erro inesperado ao listar exames.");
    }
}).RequireAuthorization();

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
app.MapGet("/exames/modalidades", (ILogger<Program> logger, IMemoryCache cache) =>
{
    const string cacheKey = "modalidades-dicom";
    
    if (cache.TryGetValue(cacheKey, out var cachedModalidades))
    {
        logger.LogDebug("Retornando modalidades do cache");
        return Results.Ok(cachedModalidades);
    }
    
    logger.LogInformation("Listando modalidades de exames disponíveis");
    var modalidades = Enum.GetValues<HealthCore.Api.Core.Domain.Enums.ModalidadeExame>()
        .Select(m => new { 
            Value = m.ToString(), 
            Description = GetModalidadeDescription(m) 
        })
        .ToList();
    
    // Cache por 24 horas (dados estáticos)
    var cacheOptions = new MemoryCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
        Priority = CacheItemPriority.High
    };
    cache.Set(cacheKey, modalidades, cacheOptions);
    
    return Results.Ok(modalidades);
});

// Endpoint para verificar idempotência
app.MapGet("/exames/check-idempotency/{idempotencyKey}", async (string idempotencyKey, ExameService exameService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Verificando idempotência para chave: {IdempotencyKey}", idempotencyKey);
        var exists = await exameService.CheckIdempotencyAsync(idempotencyKey);
        return Results.Ok(new { exists });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao verificar idempotência para chave: {IdempotencyKey}", idempotencyKey);
        return Results.Problem("Erro inesperado ao verificar idempotência.");
    }
}).RequireAuthorization();

// Endpoint para estatísticas por modalidade
app.MapGet("/exames/statistics/modalidade", async (ExameService exameService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Obtendo estatísticas de exames por modalidade");
        var statistics = await exameService.GetStatisticsByModalidadeAsync();
        return Results.Ok(statistics);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao obter estatísticas por modalidade");
        return Results.Problem("Erro inesperado ao obter estatísticas.");
    }
}).RequireAuthorization();

// Endpoint para estatísticas por período
app.MapGet("/exames/statistics/periodo", async (ExameService exameService, ILogger<Program> logger, DateTime? dataInicio = null, DateTime? dataFim = null) =>
{
    try
    {
        logger.LogInformation("Obtendo estatísticas de exames por período - Início: {DataInicio}, Fim: {DataFim}", dataInicio, dataFim);
        var statistics = await exameService.GetStatisticsByPeriodoAsync(dataInicio, dataFim);
        return Results.Ok(statistics);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao obter estatísticas por período");
        return Results.Problem("Erro inesperado ao obter estatísticas.");
    }
}).RequireAuthorization();

static string GetModalidadeDescription(HealthCore.Api.Core.Domain.Enums.ModalidadeExame modalidade)
{
    return modalidade switch
    {
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.CR => "Computed Radiography",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.CT => "Computed Tomography",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.DX => "Digital Radiography",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.MG => "Mammography",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.MR => "Magnetic Resonance",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.NM => "Nuclear Medicine",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.OT => "Other",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.PT => "Positron Emission Tomography (PET)",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.RF => "Radio Fluoroscopy",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.US => "Ultrasound",
        HealthCore.Api.Core.Domain.Enums.ModalidadeExame.XA => "X-Ray Angiography",
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
        logger.LogInformation("Listagem de usuários concluída. Usuários retornados: {Count}", users.Data.Count);
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

// Endpoints de Usuários (públicos para o frontend)
app.MapGet("/users", async (AdminService adminService, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Listando usuários - Página: {Page}, Tamanho: {PageSize}", page, pageSize);
        var users = await adminService.GetUsersAsync(page, pageSize);
        logger.LogInformation("Listagem de usuários concluída. Usuários retornados: {Count}", users.Data.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar usuários");
        return Results.Problem("Erro inesperado ao listar usuários.");
    }
}).RequireAuthorization();

app.MapGet("/users/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
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

app.MapPost("/users", async (CreateUserDto createUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Criando usuário: {Username}", createUserDto.Username);
        var user = await adminService.CreateUserAsync(createUserDto);
        logger.LogInformation("Usuário criado com sucesso: {Id}", user.Id);
        return Results.Created($"/users/{user.Id}", user);
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

app.MapPut("/users/{id:guid}", async (Guid id, UpdateUserDto updateUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Atualizando usuário: {Id}", id);
        var user = await adminService.UpdateUserAsync(id, updateUserDto);
        if (user == null)
        {
            logger.LogWarning("Usuário não encontrado para atualização: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário atualizado com sucesso: {Id}", id);
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

app.MapDelete("/users/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Desativando usuário: {Id}", id);
        var result = await adminService.DeactivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("Usuário não encontrado para desativação: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário desativado com sucesso: {Id}", id);
        return Results.Ok(new { Message = "Usuário desativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao desativar usuário: {Id}", id);
        return Results.Problem("Erro inesperado ao desativar usuário.");
    }
}).RequireAuthorization();

app.MapGet("/users/search", async (AdminService adminService, HttpContext context, ILogger<Program> logger, string? username = null, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Buscando usuários por username: {Username} - Página: {Page}, Tamanho: {PageSize}", username, page, pageSize);
        var users = await adminService.SearchUsersByUsernameAsync(username, page, pageSize);
        logger.LogInformation("Busca de usuários concluída. Usuários retornados: {Count}", users.Data.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar usuários por username");
        return Results.Problem("Erro inesperado ao buscar usuários.");
    }
}).RequireAuthorization();

// Endpoints de Usuários com prefixo /api (para compatibilidade com frontend)
app.MapGet("/api/usuarios", async (AdminService adminService, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Listando usuários via /api/usuarios - Página: {Page}, Tamanho: {PageSize}", page, pageSize);
        var users = await adminService.GetUsersAsync(page, pageSize);
        logger.LogInformation("Listagem de usuários concluída. Usuários retornados: {Count}", users.Data.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar usuários via /api/usuarios");
        return Results.Problem("Erro inesperado ao listar usuários.");
    }
}).RequireAuthorization();

app.MapGet("/api/usuarios/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        var user = await adminService.GetUserByIdAsync(id);
        if (user == null)
        {
            logger.LogWarning("Usuário não encontrado via /api/usuarios: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        return Results.Ok(user);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar usuário via /api/usuarios: {Id}", id);
        return Results.Problem("Erro inesperado ao buscar usuário.");
    }
}).RequireAuthorization();

app.MapPost("/api/usuarios", async (CreateUserDto createUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Criando usuário via /api/usuarios: {Username}", createUserDto.Username);
        var user = await adminService.CreateUserAsync(createUserDto);
        logger.LogInformation("Usuário criado com sucesso via /api/usuarios: {Id}", user.Id);
        return Results.Created($"/api/usuarios/{user.Id}", user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao criar usuário via /api/usuarios: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar usuário via /api/usuarios");
        return Results.Problem("Erro inesperado ao criar usuário.");
    }
}).RequireAuthorization();

app.MapPut("/api/usuarios/{id:guid}", async (Guid id, UpdateUserDto updateUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Atualizando usuário via /api/usuarios: {Id}", id);
        var user = await adminService.UpdateUserAsync(id, updateUserDto);
        if (user == null)
        {
            logger.LogWarning("Usuário não encontrado para atualização via /api/usuarios: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário atualizado com sucesso via /api/usuarios: {Id}", id);
        return Results.Ok(user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validação ao atualizar usuário via /api/usuarios: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar usuário via /api/usuarios: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar usuário.");
    }
}).RequireAuthorization();

app.MapDelete("/api/usuarios/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Desativando usuário via /api/usuarios: {Id}", id);
        var result = await adminService.DeactivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("Usuário não encontrado para desativação via /api/usuarios: {Id}", id);
            return Results.NotFound(new { Message = $"Usuário com ID {id} não encontrado." });
        }

        logger.LogInformation("Usuário desativado com sucesso via /api/usuarios: {Id}", id);
        return Results.Ok(new { Message = "Usuário desativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao desativar usuário via /api/usuarios: {Id}", id);
        return Results.Problem("Erro inesperado ao desativar usuário.");
    }
}).RequireAuthorization();

// Endpoints de Médicos
app.MapPost("/medicos", async (CreateMedicoDto createMedicoDto, MedicoService medicoService, ILogger<Program> logger) =>
{
    // Validação será feita pelas Data Annotations

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
        logger.LogInformation("Listagem de médicos concluída. Médicos retornados: {Count}", medicos.Data.Count);
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
    // Validação será feita pelas Data Annotations

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
    catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
    {
        // Quando há restrição de FK (pacientes/exames vinculados), o EF lança DbUpdateException
        logger.LogWarning(ex, "Exclusão de médico bloqueada por relacionamentos: {Id}", id);
        return Results.Conflict(new { Message = "Não é possível excluir este médico pois existem registros vinculados (pacientes ou exames)" });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao excluir médico: {Id}", id);
        return Results.Problem("Erro inesperado ao excluir médico.");
    }
}).RequireAuthorization();

// ==================== ENDPOINTS DE ESPECIALIDADES ====================

// GET /especialidades - Listar especialidades com paginação e filtros
app.MapGet("/especialidades", async (
    EspecialidadeService especialidadeService,
    ILogger<Program> logger,
    int page = 1,
    int pageSize = 10,
    bool? ativa = null,
    string? search = null) =>
{
    try
    {
        logger.LogInformation("Listando especialidades - Page: {Page}, PageSize: {PageSize}, Ativa: {Ativa}, Search: {Search}",
            page, pageSize, ativa, search);

        var result = await especialidadeService.GetAllAsync(page, pageSize, ativa, search);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao listar especialidades");
        return Results.Problem("Erro ao listar especialidades.");
    }
}).RequireAuthorization();

// GET /especialidades/{id} - Buscar especialidade por ID
app.MapGet("/especialidades/{id:guid}", async (
    Guid id,
    EspecialidadeService especialidadeService,
    ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Buscando especialidade por ID: {Id}", id);

        var especialidade = await especialidadeService.GetByIdAsync(id);

        if (especialidade == null)
        {
            logger.LogWarning("Especialidade não encontrada: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} não encontrada." });
        }

        return Results.Ok(especialidade);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao buscar especialidade: {Id}", id);
        return Results.Problem("Erro ao buscar especialidade.");
    }
}).RequireAuthorization();

// POST /especialidades - Criar nova especialidade (apenas Admin)
app.MapPost("/especialidades", async (
    CreateEspecialidadeDto dto,
    EspecialidadeService especialidadeService,
    HttpContext context,
    ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de criar especialidade sem permissão de administrador");
            return Results.Forbid();
        }

        logger.LogInformation("Criando nova especialidade: {Nome}", dto.Nome);

        var especialidade = await especialidadeService.CreateAsync(dto);
        return Results.Created($"/especialidades/{especialidade.Id}", especialidade);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validação ao criar especialidade");
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar especialidade");
        return Results.Problem("Erro inesperado ao criar especialidade.");
    }
}).RequireAuthorization();

// PUT /especialidades/{id} - Atualizar especialidade (apenas Admin)
app.MapPut("/especialidades/{id:guid}", async (
    Guid id,
    UpdateEspecialidadeDto dto,
    EspecialidadeService especialidadeService,
    HttpContext context,
    ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de atualizar especialidade sem permissão de administrador");
            return Results.Forbid();
        }

        logger.LogInformation("Atualizando especialidade: {Id}", id);

        var especialidade = await especialidadeService.UpdateAsync(id, dto);
        return Results.Ok(especialidade);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validação ao atualizar especialidade: {Id}", id);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar especialidade: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar especialidade.");
    }
}).RequireAuthorization();

// DELETE /especialidades/{id} - Excluir especialidade (apenas Admin)
app.MapDelete("/especialidades/{id:guid}", async (
    Guid id,
    EspecialidadeService especialidadeService,
    HttpContext context,
    ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de excluir especialidade sem permissão de administrador");
            return Results.Forbid();
        }

        logger.LogInformation("Excluindo especialidade: {Id}", id);

        var deleted = await especialidadeService.DeleteAsync(id);

        if (!deleted)
        {
            logger.LogWarning("Especialidade não encontrada para exclusão: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} não encontrada." });
        }

        logger.LogInformation("Especialidade excluída com sucesso: {Id}", id);
        return Results.NoContent();
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validação ao excluir especialidade: {Id}", id);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao excluir especialidade: {Id}", id);
        return Results.Problem("Erro inesperado ao excluir especialidade.");
    }
}).RequireAuthorization();

// ==================== FIM ENDPOINTS DE ESPECIALIDADES ====================

// ==================== ENDPOINTS DE ESPECIALIDADES COM PREFIXO /API ====================

// GET /api/especialidades - Listar especialidades com paginação e filtros
app.MapGet("/api/especialidades", async (
    EspecialidadeService especialidadeService,
    ILogger<Program> logger,
    int page = 1,
    int pageSize = 10,
    bool? ativa = null,
    string? search = null) =>
{
    try
    {
        logger.LogInformation("Listando especialidades via /api/especialidades - Page: {Page}, PageSize: {PageSize}, Ativa: {Ativa}, Search: {Search}",
            page, pageSize, ativa, search);

        var result = await especialidadeService.GetAllAsync(page, pageSize, ativa, search);
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao listar especialidades via /api/especialidades");
        return Results.Problem("Erro ao listar especialidades.");
    }
}).RequireAuthorization();

// GET /api/especialidades/{id} - Buscar especialidade por ID
app.MapGet("/api/especialidades/{id:guid}", async (
    Guid id,
    EspecialidadeService especialidadeService,
    ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Buscando especialidade por ID via /api/especialidades: {Id}", id);

        var especialidade = await especialidadeService.GetByIdAsync(id);

        if (especialidade == null)
        {
            logger.LogWarning("Especialidade não encontrada via /api/especialidades: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} não encontrada." });
        }

        return Results.Ok(especialidade);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao buscar especialidade por ID via /api/especialidades: {Id}", id);
        return Results.Problem("Erro ao buscar especialidade.");
    }
}).RequireAuthorization();

// POST /api/especialidades - Criar nova especialidade (apenas administradores)
app.MapPost("/api/especialidades", async (
    CreateEspecialidadeDto createEspecialidadeDto,
    EspecialidadeService especialidadeService,
    HttpContext context,
    ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de criar especialidade sem permissão de administrador via /api/especialidades");
            return Results.Forbid();
        }

        // Validar modelo
        var (isValid, errorResult) = ValidateModel(createEspecialidadeDto);
        if (!isValid)
            return errorResult!;

        logger.LogInformation("Criando especialidade via /api/especialidades: {Nome}", createEspecialidadeDto.Nome);

        var especialidade = await especialidadeService.CreateAsync(createEspecialidadeDto);

        logger.LogInformation("Especialidade criada com sucesso via /api/especialidades: {Id}", especialidade.Id);
        return Results.Created($"/api/especialidades/{especialidade.Id}", especialidade);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validação ao criar especialidade via /api/especialidades");
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar especialidade via /api/especialidades");
        return Results.Problem("Erro inesperado ao criar especialidade.");
    }
}).RequireAuthorization();

// PUT /api/especialidades/{id} - Atualizar especialidade (apenas administradores)
app.MapPut("/api/especialidades/{id:guid}", async (
    Guid id,
    UpdateEspecialidadeDto updateEspecialidadeDto,
    EspecialidadeService especialidadeService,
    HttpContext context,
    ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de atualizar especialidade sem permissão de administrador via /api/especialidades");
            return Results.Forbid();
        }

        // Validar modelo
        var (isValid, errorResult) = ValidateModel(updateEspecialidadeDto);
        if (!isValid)
            return errorResult!;

        logger.LogInformation("Atualizando especialidade via /api/especialidades: {Id}", id);

        var especialidade = await especialidadeService.UpdateAsync(id, updateEspecialidadeDto);

        if (especialidade == null)
        {
            logger.LogWarning("Especialidade não encontrada para atualização via /api/especialidades: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} não encontrada." });
        }

        logger.LogInformation("Especialidade atualizada com sucesso via /api/especialidades: {Id}", id);
        return Results.Ok(especialidade);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validação ao atualizar especialidade via /api/especialidades: {Id}", id);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar especialidade via /api/especialidades: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar especialidade.");
    }
}).RequireAuthorization();

// DELETE /api/especialidades/{id} - Excluir especialidade (apenas administradores)
app.MapDelete("/api/especialidades/{id:guid}", async (
    Guid id,
    EspecialidadeService especialidadeService,
    HttpContext context,
    ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuário é administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de excluir especialidade sem permissão de administrador via /api/especialidades");
            return Results.Forbid();
        }

        logger.LogInformation("Excluindo especialidade via /api/especialidades: {Id}", id);

        var deleted = await especialidadeService.DeleteAsync(id);

        if (!deleted)
        {
            logger.LogWarning("Especialidade não encontrada para exclusão via /api/especialidades: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} não encontrada." });
        }

        logger.LogInformation("Especialidade excluída com sucesso via /api/especialidades: {Id}", id);
        return Results.NoContent();
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validação ao excluir especialidade via /api/especialidades: {Id}", id);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao excluir especialidade via /api/especialidades: {Id}", id);
        return Results.Problem("Erro inesperado ao excluir especialidade.");
    }
}).RequireAuthorization();

// ==================== FIM ENDPOINTS DE ESPECIALIDADES COM PREFIXO /API ====================


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
