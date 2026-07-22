using Microsoft.EntityFrameworkCore;
using HealthCore.Api.Core.Application.DTOs;
using HealthCore.Api.Core.Application.DTOs.Auth;
using HealthCore.Api.Core.Application.DTOs.Admin;
using HealthCore.Api.Core.Application.Services;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Infrastructure.Middleware;
using HealthCore.Api.Infrastructure.Security;
using HealthCore.Api.Infrastructure.Extensions;
using Serilog;
using Serilog.Formatting.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;
using Microsoft.OpenApi.Models;

// Configurar o Serilog
Log.Logger = new LoggerConfiguration()
    .Enrich.WithProperty("Application", "HealthCore.Api")
    .Enrich.WithProperty("Environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production")
    .Enrich.WithEnvironmentName()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.File(
        path: "log/healthcore-.log", 
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
var isDevelopment = builder.Environment.IsDevelopment();

builder.Services.AddHealthCorePlatform(builder.Configuration);
builder.Services.AddHealthCorePersistence(builder.Configuration, builder.Environment);
builder.Services.AddHealthCoreSecurity(builder.Configuration, builder.Environment);
// Add Serilog
builder.Host.UseSerilog();

// The web host listens on the internal container port.

builder.WebHost.UseUrls("http://0.0.0.0:5000"); // Configure Kestrel to listen on all interfaces

var app = builder.Build();
const string RefreshCookieName = "healthcore_refresh";

void SetRefreshCookie(HttpContext context, string refreshToken)
{
    var expiryDays = builder.Configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays", 7);
    var secureCookies = builder.Configuration.GetValue("Security:RefreshCookieSecure", !isDevelopment);

    context.Response.Cookies.Append(RefreshCookieName, refreshToken, new Microsoft.AspNetCore.Http.CookieOptions
    {
        HttpOnly = true,
        Secure = secureCookies,
        SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax,
        Path = "/",
        Expires = DateTimeOffset.UtcNow.AddDays(expiryDays)
    });
}

void ClearRefreshCookie(HttpContext context)
{
    context.Response.Cookies.Delete(RefreshCookieName, new Microsoft.AspNetCore.Http.CookieOptions
    {
        HttpOnly = true,
        Secure = builder.Configuration.GetValue("Security:RefreshCookieSecure", !isDevelopment),
        SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax,
        Path = "/"
    });
}

app.ApplyHealthCoreMigrations();

if (app.Environment.IsEnvironment("E2E"))
{
    await app.SeedHealthCoreE2eUserAsync();
}

// Helper method for model validation
static (bool IsValid, IResult? ErrorResult) ValidateModel<T>(T model) where T : class
{
    var context = new ValidationContext(model);
    var results = new List<ValidationResult>();
    
    if (!Validator.TryValidateObject(model, context, results, true))
    {
        var errors = results.Select(r => r.ErrorMessage).ToList();
        return (false, Results.BadRequest(new { Message = "Dados invÃ¡lidos", Errors = errors }));
    }
    
    return (true, null);
}

// Configure PathBase for Nginx Proxy
app.UsePathBase("/healthcore-api");

var openApiEnabled = isDevelopment || builder.Configuration.GetValue<bool>("OpenApi:Enabled", false);

// Keep API documentation disabled in production unless explicitly enabled.
if (openApiEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/healthcore/swagger/v1/swagger.json", "HealthCore API V1");
        c.RoutePrefix = "swagger";
    });
}

if (builder.Configuration.GetValue<bool>("Security:RequireHttps", false))
{
    app.UseHttpsRedirection();
}

app.UseSerilogRequestLogging();

// Security headers (enable by config)
var enableSecurityHeaders = builder.Configuration.GetValue<bool>("Security:EnableSecurityHeaders", true);
if (enableSecurityHeaders)
{
    app.UseSecurityHeaders();
}

app.UseRateLimiter();

// Use CORS
app.UseCors("AllowProxy");

app.UseAuthentication(); // Use Authentication middleware
app.UseMiddleware<TokenBlacklistMiddleware>(); // Use Token Blacklist middleware

// Swagger is intentionally public only when it is explicitly enabled. All
// application endpoints continue to use the global authenticated fallback policy.
if (openApiEnabled)
{
    app.UseWhen(
        context => !context.Request.Path.StartsWithSegments("/swagger"),
        branch => branch.UseAuthorization());
}
else
{
    app.UseAuthorization();
}

// Health Check Endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString().ToLowerInvariant(),
            timestamp = DateTime.UtcNow,
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString().ToLowerInvariant()
            })
        };

        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
}).AllowAnonymous();

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
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString().ToLowerInvariant()
            })
        };

        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
}).AllowAnonymous();

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
}).AllowAnonymous();

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
app.MapPost("/pacientes", async (CreatePacienteDto createPacienteDto, PacienteService pacienteService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    // Validar modelo
    var (isValid, errorResult) = ValidateModel(createPacienteDto);
    if (!isValid)
        return errorResult!;

    try
    {
        logger.LogInformation("Iniciando criaÃ§Ã£o de paciente: {Nome}, Documento: {Documento}", createPacienteDto.Nome, createPacienteDto.Documento);
        var medicoId = await resourceAuthorization.GetCurrentMedicoIdAsync(context.User);
        if (!resourceAuthorization.IsAdministrator(context.User) && !medicoId.HasValue)
            return Results.Forbid();

        var paciente = await pacienteService.CreatePacienteAsync(createPacienteDto, medicoId);
        logger.LogInformation("Paciente criado com sucesso: {Id}", paciente.Id);
        return Results.Created($"/pacientes/{paciente.Id}", paciente);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Tentativa de criaÃ§Ã£o de paciente com documento duplicado: {Documento}. Erro: {Message}", createPacienteDto.Documento, ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
});

app.MapGet("/pacientes", async (PacienteService pacienteService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Listando pacientes - PÃ¡gina: {Page}, Tamanho da pÃ¡gina: {PageSize}", page, pageSize);
        
        // Verificar o role do usuÃ¡rio logado
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        Guid? medicoId = null;
        
        // Se for mÃ©dico, filtrar apenas seus pacientes
        if (userRole == UserRole.Medico.ToString() && !string.IsNullOrEmpty(userId))
        {
            // Buscar o ID do mÃ©dico baseado no UserId
            using var scope = context.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
            
            var medico = await dbContext.Medicos
                .FirstOrDefaultAsync(m => m.UserId == Guid.Parse(userId));
                
            if (medico != null)
            {
                medicoId = medico.Id;
                logger.LogInformation("Filtrando pacientes para o mÃ©dico: {MedicoId}", medicoId);
            }
        }
        
        if (userRole == UserRole.Medico.ToString() && !medicoId.HasValue)
            return Results.Forbid();

        var pacientes = await pacienteService.GetPacientesAsync(page, pageSize, medicoId);
        logger.LogInformation("Listagem de pacientes concluÃ­da. NÃºmero de pacientes retornados: {Count}", pacientes.Data.Count);
        return Results.Ok(pacientes);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar pacientes");
        return Results.Problem("Erro inesperado ao listar pacientes.");
    }
}).RequireAuthorization();

app.MapPut("/pacientes/{id:guid}", async (Guid id, UpdatePacienteDto updatePacienteDto, PacienteService pacienteService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Iniciando atualizaÃ§Ã£o de paciente com ID: {Id}", id);
        if (!await resourceAuthorization.CanAccessPatientAsync(id, context.User))
            return Results.NotFound(new { Message = $"Paciente com ID {id} não encontrado." });

        var paciente = await pacienteService.UpdatePacienteAsync(id, updatePacienteDto);
        if (paciente == null)
        {
            logger.LogWarning("Paciente com ID: {Id} nÃ£o encontrado para atualizaÃ§Ã£o.", id);
            return Results.NotFound(new { Message = $"Paciente com ID {id} nÃ£o encontrado." });
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

app.MapDelete("/pacientes/{id:guid}", async (Guid id, PacienteService pacienteService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    logger.LogInformation("Iniciando exclusÃ£o de paciente com ID: {Id}", id);
    if (!await resourceAuthorization.CanAccessPatientAsync(id, context.User))
        return Results.NotFound(new { Message = $"Paciente com ID {id} não encontrado." });

    var result = await pacienteService.DeletePacienteAsync(id);
    if (!result)
    {
        logger.LogWarning("Paciente com ID: {Id} nÃ£o encontrado para exclusÃ£o.", id);
        return Results.NotFound(new { Message = $"Paciente com ID {id} nÃ£o encontrado." });
    }
    logger.LogInformation("Paciente com ID: {Id} excluÃ­do com sucesso.", id);
    return Results.NoContent();
});

app.MapGet("/pacientes/{id:guid}", async (Guid id, PacienteService pacienteService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    logger.LogInformation("Buscando paciente com ID: {Id}", id);
    if (!await resourceAuthorization.CanAccessPatientAsync(id, context.User))
        return Results.NotFound(new { Message = $"Paciente com ID {id} não encontrado." });

    var paciente = await pacienteService.GetPacienteByIdAsync(id);
    if (paciente == null)
    {
        logger.LogWarning("Paciente com ID: {Id} nÃ£o encontrado.", id);
        return Results.NotFound(new { Message = $"Paciente com ID {id} nÃ£o encontrado." });
    }
    logger.LogInformation("Paciente encontrado: {Id}", id);
    return Results.Ok(paciente);
}).RequireAuthorization();

app.MapGet("/pacientes/search", async (PacienteService pacienteService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger, string? nome = null, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Buscando pacientes por nome: {Nome} - PÃ¡gina: {Page}, Tamanho: {PageSize}", nome, page, pageSize);
        
        // Verificar o role do usuÃ¡rio logado
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        Guid? medicoId = null;
        
        // Se for mÃ©dico, filtrar apenas seus pacientes
        if (userRole == UserRole.Medico.ToString() && !string.IsNullOrEmpty(userId))
        {
            using var scope = context.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();
            
            var medico = await dbContext.Medicos
                .FirstOrDefaultAsync(m => m.UserId == Guid.Parse(userId));
                
            if (medico != null)
            {
                medicoId = medico.Id;
                logger.LogInformation("Filtrando pacientes para o mÃ©dico: {MedicoId}", medicoId);
            }
        }
        
        if (userRole == UserRole.Medico.ToString() && !medicoId.HasValue)
            return Results.Forbid();

        var pacientes = await pacienteService.SearchPacientesByNomeAsync(nome, page, pageSize, medicoId);
        logger.LogInformation("Busca de pacientes concluÃ­da. NÃºmero de pacientes retornados: {Count}", pacientes.Data.Count);
        return Results.Ok(pacientes);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar pacientes por nome");
        return Results.Problem("Erro inesperado ao buscar pacientes.");
    }
}).RequireAuthorization();

// Endpoints para Exames
app.MapPost("/exames", async (CreateExameDto createExameDto, ExameService exameService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    // Validar modelo
    var (isValid, errorResult) = ValidateModel(createExameDto);
    if (!isValid)
        return errorResult!;

    try
    {
        logger.LogInformation("Iniciando criaÃ§Ã£o de exame para paciente: {PacienteId}, IdempotencyKey: {IdempotencyKey}", createExameDto.PacienteId, createExameDto.IdempotencyKey);
        if (!await resourceAuthorization.CanAccessPatientAsync(createExameDto.PacienteId, context.User))
            return Results.NotFound(new { Message = "Paciente não encontrado." });

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
        logger.LogWarning("Modalidade invÃ¡lida no exame. Erro: {Message}", ex.Message);
        return Results.BadRequest(new { Message = ex.Message });
    }
});

app.MapGet("/exames", async (HttpContext context, ExameService exameService, HealthCoreDbContext dbContext, int page = 1, int pageSize = 10, string? modalidade = null, Guid? pacienteId = null, DateTime? dataInicio = null, DateTime? dataFim = null, ILogger<Program> logger = null!) =>
{
    try
    {
        logger.LogInformation("Listando exames - PÃ¡gina: {Page}, Tamanho da pÃ¡gina: {PageSize}, Modalidade: {Modalidade}, PacienteId: {PacienteId}", page, pageSize, modalidade, pacienteId);
        
        // Obter informaÃ§Ãµes do usuÃ¡rio logado
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRoleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userRoleClaim))
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o autenticado tentando acessar exames");
            return Results.Unauthorized();
        }
        
        var userId = Guid.Parse(userIdClaim);
        var userRole = Enum.Parse<UserRole>(userRoleClaim);
        
        Guid? medicoId = null;
        
        // Se for mÃ©dico, filtrar apenas exames dos seus pacientes
        if (userRole == UserRole.Medico)
        {
            var medico = await dbContext.Medicos.FirstOrDefaultAsync(m => m.UserId == userId);
            if (medico == null)
            {
                logger.LogWarning("MÃ©dico nÃ£o encontrado para o usuÃ¡rio {UserId}", userId);
                return Results.NotFound(new { Message = "MÃ©dico nÃ£o encontrado" });
            }
            medicoId = medico.Id;
            logger.LogInformation("Filtrando exames dos pacientes do mÃ©dico {MedicoId}", medicoId);
        }
        else
        {
            logger.LogInformation("UsuÃ¡rio administrador - listando todos os exames");
        }
        
        var exames = await exameService.GetExamesAsync(page, pageSize, modalidade, pacienteId, dataInicio, dataFim, medicoId);
        logger.LogInformation("Listagem de exames concluÃ­da. NÃºmero de exames retornados: {Count}", exames.Data.Count);
        return Results.Ok(exames);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar exames");
        return Results.Problem("Erro inesperado ao listar exames.");
    }
}).RequireAuthorization();

app.MapGet("/exames/{id:guid}", async (Guid id, ExameService exameService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    logger.LogInformation("Buscando exame com ID: {Id}", id);
    if (!await resourceAuthorization.CanAccessExamAsync(id, context.User))
        return Results.NotFound(new { Message = $"Exame com ID {id} não encontrado." });

    var exame = await exameService.GetExameByIdAsync(id);
    if (exame == null)
    {
        logger.LogWarning("Exame com ID: {Id} nÃ£o encontrado.", id);
        return Results.NotFound(new { Message = $"Exame com ID {id} nÃ£o encontrado." });
    }
    logger.LogInformation("Exame encontrado: {Id}", id);
    return Results.Ok(exame);
});

app.MapPut("/exames/{id:guid}", async (Guid id, UpdateExameDto updateExameDto, ExameService exameService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Iniciando atualizaÃ§Ã£o de exame com ID: {Id}", id);
        if (!await resourceAuthorization.CanAccessExamAsync(id, context.User) || !await resourceAuthorization.CanAccessPatientAsync(updateExameDto.PacienteId, context.User))
            return Results.NotFound(new { Message = $"Exame com ID {id} não encontrado." });

        var exame = await exameService.UpdateExameAsync(id, updateExameDto);
        if (exame == null)
        {
            logger.LogWarning("Exame com ID: {Id} nÃ£o encontrado para atualizaÃ§Ã£o.", id);
            return Results.NotFound(new { Message = $"Exame com ID {id} nÃ£o encontrado." });
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

app.MapDelete("/exames/{id:guid}", async (Guid id, ExameService exameService, ResourceAuthorizationService resourceAuthorization, HttpContext context, ILogger<Program> logger) =>
{
    logger.LogInformation("Iniciando exclusÃ£o de exame com ID: {Id}", id);
    if (!await resourceAuthorization.CanAccessExamAsync(id, context.User))
        return Results.NotFound(new { Message = $"Exame com ID {id} não encontrado." });

    var result = await exameService.DeleteExameAsync(id);
    if (!result)
    {
        logger.LogWarning("Exame com ID: {Id} nÃ£o encontrado para exclusÃ£o.", id);
        return Results.NotFound(new { Message = $"Exame com ID {id} nÃ£o encontrado." });
    }
    logger.LogInformation("Exame com ID: {Id} excluÃ­do com sucesso.", id);
    return Results.NoContent();
});

// Endpoint para listar modalidades disponÃ­veis
app.MapGet("/exames/modalidades", (ILogger<Program> logger, IMemoryCache cache) =>
{
    const string cacheKey = "modalidades-dicom";
    
    if (cache.TryGetValue(cacheKey, out var cachedModalidades))
    {
        logger.LogDebug("Retornando modalidades do cache");
        return Results.Ok(cachedModalidades);
    }
    
    logger.LogInformation("Listando modalidades de exames disponÃ­veis");
    var modalidades = Enum.GetValues<HealthCore.Api.Core.Domain.Enums.ModalidadeExame>()
        .Select(m => new { 
            Value = m.ToString(), 
            Description = GetModalidadeDescription(m) 
        })
        .ToList();
    
    // Cache por 24 horas (dados estÃ¡ticos)
    var cacheOptions = new MemoryCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
        Priority = CacheItemPriority.High
    };
    cache.Set(cacheKey, modalidades, cacheOptions);
    
    return Results.Ok(modalidades);
});

// Endpoint para verificar idempotÃªncia
app.MapGet("/exames/check-idempotency/{idempotencyKey}", async (string idempotencyKey, ExameService exameService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Verificando idempotÃªncia para chave: {IdempotencyKey}", idempotencyKey);
        var exists = await exameService.CheckIdempotencyAsync(idempotencyKey);
        return Results.Ok(new { exists });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao verificar idempotÃªncia para chave: {IdempotencyKey}", idempotencyKey);
        return Results.Problem("Erro inesperado ao verificar idempotÃªncia.");
    }
}).RequireAuthorization();

// Endpoint para estatÃ­sticas por modalidade
app.MapGet("/exames/statistics/modalidade", async (ExameService exameService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Obtendo estatÃ­sticas de exames por modalidade");
        var statistics = await exameService.GetStatisticsByModalidadeAsync();
        return Results.Ok(statistics);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao obter estatÃ­sticas por modalidade");
        return Results.Problem("Erro inesperado ao obter estatÃ­sticas.");
    }
}).RequireAuthorization();

// Endpoint para estatÃ­sticas por perÃ­odo
app.MapGet("/exames/statistics/periodo", async (ExameService exameService, ILogger<Program> logger, DateTime? dataInicio = null, DateTime? dataFim = null) =>
{
    try
    {
        logger.LogInformation("Obtendo estatÃ­sticas de exames por perÃ­odo - InÃ­cio: {DataInicio}, Fim: {DataFim}", dataInicio, dataFim);
        var statistics = await exameService.GetStatisticsByPeriodoAsync(dataInicio, dataFim);
        return Results.Ok(statistics);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro ao obter estatÃ­sticas por perÃ­odo");
        return Results.Problem("Erro inesperado ao obter estatÃ­sticas.");
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
        logger.LogInformation("UsuÃ¡rio {Username} registrado com sucesso.", user.Username);
        return Results.Created($"/auth/register/{user.Id}", new { Message = "UsuÃ¡rio registrado com sucesso." });
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
}).RequireAuthorization(policy => policy.RequireRole(UserRole.Administrador.ToString())).RequireRateLimiting("auth");

app.MapPost("/auth/login", async (LoginRequestDto loginDto, HttpContext context, AuthService authService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Tentativa de login para usuÃ¡rio: {Username}", loginDto.Username);
        var result = await authService.LoginAsync(loginDto.Username, loginDto.Password);

        if (result == null)
        {
            logger.LogWarning("Falha na autenticaÃ§Ã£o para usuÃ¡rio: {Username}", loginDto.Username);
            return Results.Unauthorized();
        }

        SetRefreshCookie(context, result.RefreshToken);
        logger.LogInformation("UsuÃ¡rio {Username} logado com sucesso", loginDto.Username);
        return Results.Ok(new
        {
            Token = result.Token,
            ExpiresAt = result.ExpiresAt,
            User = result.User
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado durante login para usuÃ¡rio: {Username}", loginDto.Username);
        return Results.Problem("Erro inesperado durante o login.");
    }
}).AllowAnonymous().RequireRateLimiting("auth");

app.MapPost("/auth/refresh", async (HttpContext context, AuthService authService, ILogger<Program> logger) =>
{
    try
    {
        var refreshToken = context.Request.Cookies[RefreshCookieName];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return Results.Unauthorized();
        }

        var result = await authService.RefreshTokenAsync(refreshToken);
        if (result == null)
        {
            logger.LogWarning("Refresh token invÃ¡lido ou expirado");
            ClearRefreshCookie(context);
            return Results.Unauthorized();
        }

        SetRefreshCookie(context, result.RefreshToken);
        return Results.Ok(new
        {
            Token = result.Token,
            ExpiresAt = result.ExpiresAt,
            User = result.User
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado durante refresh token");
        return Results.Problem("Erro inesperado durante refresh do token.");
    }
}).AllowAnonymous().RequireRateLimiting("auth");

app.MapPost("/auth/logout", async (HttpContext context, AuthService authService, ILogger<Program> logger) =>
{
    try
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
        if (string.IsNullOrEmpty(token))
        {
            ClearRefreshCookie(context);
            return Results.Unauthorized();
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var jsonToken = tokenHandler.ReadJwtToken(token);
        var tokenId = jsonToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
        if (string.IsNullOrEmpty(tokenId))
        {
            ClearRefreshCookie(context);
            return Results.BadRequest("Token invÃ¡lido");
        }

        var result = await authService.LogoutAsync(tokenId);
        var refreshToken = context.Request.Cookies[RefreshCookieName];
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await authService.RevokeRefreshTokenAsync(refreshToken);
        }

        ClearRefreshCookie(context);
        return result
            ? Results.Ok(new { Message = "Logout realizado com sucesso" })
            : Results.Problem("Erro durante logout");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado durante logout");
        ClearRefreshCookie(context);
        return Results.Problem("Erro inesperado durante logout.");
    }
}).RequireAuthorization();

// Endpoints Administrativos (requer perfil Administrador)
app.MapPost("/admin/usuarios", async (CreateUserDto createUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Criando usuÃ¡rio via admin: {Username}", createUserDto.Username);
        var user = await adminService.CreateUserAsync(createUserDto);
        logger.LogInformation("UsuÃ¡rio criado com sucesso via admin: {Id}", user.Id);
        return Results.Created($"/admin/usuarios/{user.Id}", user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao criar usuÃ¡rio: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar usuÃ¡rio");
        return Results.Problem("Erro inesperado ao criar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapGet("/admin/usuarios", async (AdminService adminService, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Listando usuÃ¡rios via admin - PÃ¡gina: {Page}, Tamanho: {PageSize}", page, pageSize);
        var users = await adminService.GetUsersAsync(page, pageSize);
        logger.LogInformation("Listagem de usuÃ¡rios concluÃ­da. UsuÃ¡rios retornados: {Count}", users.Data.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar usuÃ¡rios");
        return Results.Problem("Erro inesperado ao listar usuÃ¡rios.");
    }
}).RequireAuthorization();

app.MapGet("/admin/usuarios/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        var user = await adminService.GetUserByIdAsync(id);
        if (user == null)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        return Results.Ok(user);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao buscar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapPut("/admin/usuarios/{id:guid}", async (Guid id, UpdateUserDto updateUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Atualizando usuÃ¡rio via admin: {Id}", id);
        var user = await adminService.UpdateUserAsync(id, updateUserDto);
        if (user == null)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado para atualizaÃ§Ã£o: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("UsuÃ¡rio atualizado com sucesso via admin: {Id}", id);
        return Results.Ok(user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao atualizar usuÃ¡rio: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapDelete("/admin/usuarios/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Desativando usuÃ¡rio via admin: {Id}", id);
        var result = await adminService.DeactivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado para desativaÃ§Ã£o: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("UsuÃ¡rio desativado com sucesso via admin: {Id}", id);
        return Results.Ok(new { Message = "UsuÃ¡rio desativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao desativar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao desativar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapPatch("/admin/usuarios/{id:guid}/ativar", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado ao endpoint administrativo");
            return Results.Forbid();
        }

        logger.LogInformation("Ativando usuÃ¡rio via admin: {Id}", id);
        var result = await adminService.ActivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado para ativaÃ§Ã£o: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("UsuÃ¡rio ativado com sucesso via admin: {Id}", id);
        return Results.Ok(new { Message = "UsuÃ¡rio ativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao ativar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao ativar usuÃ¡rio.");
    }
}).RequireAuthorization();

// Endpoints de UsuÃ¡rios (pÃºblicos para o frontend)
app.MapGet("/users", async (AdminService adminService, HttpContext context, ILogger<Program> logger, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Listando usuÃ¡rios - PÃ¡gina: {Page}, Tamanho: {PageSize}", page, pageSize);
        var users = await adminService.GetUsersAsync(page, pageSize);
        logger.LogInformation("Listagem de usuÃ¡rios concluÃ­da. UsuÃ¡rios retornados: {Count}", users.Data.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar usuÃ¡rios");
        return Results.Problem("Erro inesperado ao listar usuÃ¡rios.");
    }
}).RequireAuthorization();

app.MapGet("/users/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        var user = await adminService.GetUserByIdAsync(id);
        if (user == null)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        return Results.Ok(user);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao buscar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapPost("/users", async (CreateUserDto createUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Criando usuÃ¡rio: {Username}", createUserDto.Username);
        var user = await adminService.CreateUserAsync(createUserDto);
        logger.LogInformation("UsuÃ¡rio criado com sucesso: {Id}", user.Id);
        return Results.Created($"/users/{user.Id}", user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao criar usuÃ¡rio: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar usuÃ¡rio");
        return Results.Problem("Erro inesperado ao criar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapPut("/users/{id:guid}", async (Guid id, UpdateUserDto updateUserDto, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Atualizando usuÃ¡rio: {Id}", id);
        var user = await adminService.UpdateUserAsync(id, updateUserDto);
        if (user == null)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado para atualizaÃ§Ã£o: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("UsuÃ¡rio atualizado com sucesso: {Id}", id);
        return Results.Ok(user);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao atualizar usuÃ¡rio: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapDelete("/users/{id:guid}", async (Guid id, AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Desativando usuÃ¡rio: {Id}", id);
        var result = await adminService.DeactivateUserAsync(id);
        if (!result)
        {
            logger.LogWarning("UsuÃ¡rio nÃ£o encontrado para desativaÃ§Ã£o: {Id}", id);
            return Results.NotFound(new { Message = $"UsuÃ¡rio com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("UsuÃ¡rio desativado com sucesso: {Id}", id);
        return Results.Ok(new { Message = "UsuÃ¡rio desativado com sucesso." });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao desativar usuÃ¡rio: {Id}", id);
        return Results.Problem("Erro inesperado ao desativar usuÃ¡rio.");
    }
}).RequireAuthorization();

app.MapGet("/users/search", async (AdminService adminService, HttpContext context, ILogger<Program> logger, string? username = null, int page = 1, int pageSize = 10) =>
{
    try
    {
        logger.LogInformation("Buscando usuÃ¡rios por username: {Username} - PÃ¡gina: {Page}, Tamanho: {PageSize}", username, page, pageSize);
        var users = await adminService.SearchUsersByUsernameAsync(username, page, pageSize);
        logger.LogInformation("Busca de usuÃ¡rios concluÃ­da. UsuÃ¡rios retornados: {Count}", users.Data.Count);
        return Results.Ok(users);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar usuÃ¡rios por username");
        return Results.Problem("Erro inesperado ao buscar usuÃ¡rios.");
    }
}).RequireAuthorization();

// Endpoints de MÃ©dicos
app.MapPost("/medicos", async (CreateMedicoDto createMedicoDto, MedicoService medicoService, ILogger<Program> logger) =>
{
    // ValidaÃ§Ã£o serÃ¡ feita pelas Data Annotations

    try
    {
        logger.LogInformation("Criando mÃ©dico: {Nome}", createMedicoDto.Nome);
        var medico = await medicoService.CreateMedicoAsync(createMedicoDto);
        logger.LogInformation("MÃ©dico criado com sucesso: {Id}", medico.Id);
        return Results.Created($"/medicos/{medico.Id}", medico);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao criar mÃ©dico: {Message}", ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao criar mÃ©dico");
        return Results.Problem("Erro inesperado ao criar mÃ©dico.");
    }
}).RequireAuthorization(policy => policy.RequireRole(UserRole.Administrador.ToString()));

app.MapGet("/medicos", async (MedicoService medicoService, ILogger<Program> logger, int page = 1, int pageSize = 7) =>
{
    try
    {
        logger.LogInformation("Listando mÃ©dicos - PÃ¡gina: {Page}, Tamanho: {PageSize}", page, pageSize);
        var medicos = await medicoService.GetMedicosAsync(page, pageSize);
        logger.LogInformation("Listagem de mÃ©dicos concluÃ­da. MÃ©dicos retornados: {Count}", medicos.Data.Count);
        return Results.Ok(medicos);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao listar mÃ©dicos");
        return Results.Problem("Erro inesperado ao listar mÃ©dicos.");
    }
}).RequireAuthorization();

app.MapGet("/medicos/{id:guid}", async (Guid id, MedicoService medicoService, ILogger<Program> logger) =>
{
    try
    {
        var medico = await medicoService.GetMedicoByIdAsync(id);
        if (medico == null)
        {
            logger.LogWarning("MÃ©dico nÃ£o encontrado: {Id}", id);
            return Results.NotFound(new { Message = $"MÃ©dico com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("MÃ©dico encontrado: {Id}", id);
        return Results.Ok(medico);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao buscar mÃ©dico: {Id}", id);
        return Results.Problem("Erro inesperado ao buscar mÃ©dico.");
    }
}).RequireAuthorization();

app.MapPut("/medicos/{id:guid}", async (Guid id, UpdateMedicoDto updateMedicoDto, MedicoService medicoService, ILogger<Program> logger) =>
{
    // ValidaÃ§Ã£o serÃ¡ feita pelas Data Annotations

    try
    {
        logger.LogInformation("Atualizando mÃ©dico: {Id}", id);
        var medico = await medicoService.UpdateMedicoAsync(id, updateMedicoDto);
        if (medico == null)
        {
            logger.LogWarning("MÃ©dico nÃ£o encontrado para atualizaÃ§Ã£o: {Id}", id);
            return Results.NotFound(new { Message = $"MÃ©dico com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("MÃ©dico atualizado com sucesso: {Id}", id);
        return Results.Ok(medico);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao atualizar mÃ©dico {Id}: {Message}", id, ex.Message);
        return Results.Conflict(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao atualizar mÃ©dico: {Id}", id);
        return Results.Problem("Erro inesperado ao atualizar mÃ©dico.");
    }
}).RequireAuthorization(policy => policy.RequireRole(UserRole.Administrador.ToString()));

app.MapDelete("/medicos/{id:guid}", async (Guid id, MedicoService medicoService, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Excluindo mÃ©dico: {Id}", id);
        var success = await medicoService.DeleteMedicoAsync(id);
        if (!success)
        {
            logger.LogWarning("MÃ©dico nÃ£o encontrado para exclusÃ£o: {Id}", id);
            return Results.NotFound(new { Message = $"MÃ©dico com ID {id} nÃ£o encontrado." });
        }

        logger.LogInformation("MÃ©dico excluÃ­do com sucesso: {Id}", id);
        return Results.NoContent();
    }
    catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
    {
        // Quando hÃ¡ restriÃ§Ã£o de FK (pacientes/exames vinculados), o EF lanÃ§a DbUpdateException
        logger.LogWarning(ex, "ExclusÃ£o de mÃ©dico bloqueada por relacionamentos: {Id}", id);
        return Results.Conflict(new { Message = "NÃ£o Ã© possÃ­vel excluir este mÃ©dico pois existem registros vinculados (pacientes ou exames)" });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao excluir mÃ©dico: {Id}", id);
        return Results.Problem("Erro inesperado ao excluir mÃ©dico.");
    }
}).RequireAuthorization(policy => policy.RequireRole(UserRole.Administrador.ToString()));

// ==================== ENDPOINTS DE ESPECIALIDADES ====================

// GET /especialidades - Listar especialidades com paginaÃ§Ã£o e filtros
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
            logger.LogWarning("Especialidade nÃ£o encontrada: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} nÃ£o encontrada." });
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
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de criar especialidade sem permissÃ£o de administrador");
            return Results.Forbid();
        }

        logger.LogInformation("Criando nova especialidade: {Nome}", dto.Nome);

        var especialidade = await especialidadeService.CreateAsync(dto);
        return Results.Created($"/especialidades/{especialidade.Id}", especialidade);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validaÃ§Ã£o ao criar especialidade");
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
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de atualizar especialidade sem permissÃ£o de administrador");
            return Results.Forbid();
        }

        logger.LogInformation("Atualizando especialidade: {Id}", id);

        var especialidade = await especialidadeService.UpdateAsync(id, dto);
        return Results.Ok(especialidade);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validaÃ§Ã£o ao atualizar especialidade: {Id}", id);
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
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de excluir especialidade sem permissÃ£o de administrador");
            return Results.Forbid();
        }

        logger.LogInformation("Excluindo especialidade: {Id}", id);

        var deleted = await especialidadeService.DeleteAsync(id);

        if (!deleted)
        {
            logger.LogWarning("Especialidade nÃ£o encontrada para exclusÃ£o: {Id}", id);
            return Results.NotFound(new { Message = $"Especialidade com ID {id} nÃ£o encontrada." });
        }

        logger.LogInformation("Especialidade excluÃ­da com sucesso: {Id}", id);
        return Results.NoContent();
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning(ex, "Erro de validaÃ§Ã£o ao excluir especialidade: {Id}", id);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao excluir especialidade: {Id}", id);
        return Results.Problem("Erro inesperado ao excluir especialidade.");
    }
}).RequireAuthorization();

// ==================== FIM ENDPOINTS DE ESPECIALIDADES ====================

// Endpoints de MÃ©tricas
app.MapGet("/admin/metrics", async (AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado Ã s mÃ©tricas administrativas");
            return Results.Forbid();
        }

        logger.LogInformation("Gerando mÃ©tricas administrativas");
        var metrics = await adminService.GetAdminMetricsAsync();
        return Results.Ok(metrics);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao gerar mÃ©tricas administrativas");
        return Results.Problem("Erro inesperado ao gerar mÃ©tricas.");
    }
}).RequireAuthorization();

app.MapGet("/medico/metrics", async (AdminService adminService, HttpContext context, ILogger<Program> logger) =>
{
    try
    {
        // Verificar se o usuÃ¡rio Ã© mÃ©dico ou administrador
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Results.BadRequest("ID do usuÃ¡rio invÃ¡lido");
        }

        if (userRole != UserRole.Medico.ToString() && userRole != UserRole.Administrador.ToString())
        {
            logger.LogWarning("Tentativa de acesso nÃ£o autorizado Ã s mÃ©tricas de mÃ©dico");
            return Results.Forbid();
        }

        logger.LogInformation("Gerando mÃ©tricas para mÃ©dico: {UserId}", userGuid);
        var metrics = await adminService.GetMedicoMetricsAsync(userGuid);
        return Results.Ok(metrics);
    }
    catch (InvalidOperationException ex)
    {
        logger.LogWarning("Erro de validaÃ§Ã£o ao gerar mÃ©tricas de mÃ©dico: {Message}", ex.Message);
        return Results.BadRequest(new { Message = ex.Message });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro inesperado ao gerar mÃ©tricas de mÃ©dico");
        return Results.Problem("Erro inesperado ao gerar mÃ©tricas.");
    }
}).RequireAuthorization();


app.Run();


public partial class Program { }
