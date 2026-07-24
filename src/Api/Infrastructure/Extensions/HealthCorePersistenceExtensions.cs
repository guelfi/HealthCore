using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace HealthCore.Api.Infrastructure.Extensions;

public static class HealthCorePersistenceExtensions
{
    public static IServiceCollection AddHealthCorePersistence(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connection = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=database/healthcore.db";

        const string dataSourcePrefix = "Data Source=";
        var databasePath = connection.StartsWith(dataSourcePrefix, StringComparison.OrdinalIgnoreCase)
            ? connection[dataSourcePrefix.Length..]
            : connection;

        if (!Path.IsPathRooted(databasePath))
        {
            databasePath = Path.Combine(environment.ContentRootPath, databasePath);
            connection = $"{dataSourcePrefix}{databasePath}";
        }

        services.AddDbContext<HealthCoreDbContext>(options =>
            options.UseSqlite(connection));

        return services;
    }

    public static void ApplyHealthCoreMigrations(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();

        try
        {
            database.Database.Migrate();
            database.EnsureBillingSchema();
            app.EnsureHealthCoreDemoDataAsync().GetAwaiter().GetResult();
        }
        catch (Exception exception)
        {
            Log.Error(exception, "Failed to apply HealthCore database migrations");
            throw;
        }
    }

    private static async Task EnsureHealthCoreDemoDataAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<HealthCoreDbContext>();

        // 1. Ensure Especialidades
        var especialidadesNames = new[] { "Cardiologia", "Pediatria", "Ortopedia", "Radiologia", "Neurologia", "Ginecologia" };
        foreach (var espName in especialidadesNames)
        {
            if (!await database.Especialidades.AnyAsync(e => e.Nome == espName))
            {
                database.Especialidades.Add(new Especialidade
                {
                    Id = Guid.NewGuid(),
                    Nome = espName,
                    Descricao = $"Especialidade em {espName}",
                    Ativa = true,
                    DataCriacao = DateTime.UtcNow
                });
            }
        }
        await database.SaveChangesAsync();

        // 2. Demo Password Configuration
        var demoPassword = app.Configuration["Seed:DemoPassword"];
        if (string.IsNullOrWhiteSpace(demoPassword))
        {
            demoPassword = "admin123";
        }

        var normalizePasswords = app.Configuration.GetValue<bool>("Seed:NormalizeDemoPasswords", true);

        // 3. Admin User
        var adminUser = await database.Users.FirstOrDefaultAsync(u => u.Username == "admin");
        if (adminUser == null)
        {
            adminUser = new User
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                Role = UserRole.Administrador,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            adminUser.SetPassword(demoPassword);
            database.Users.Add(adminUser);
            await database.SaveChangesAsync();
        }
        else if (normalizePasswords)
        {
            adminUser.SetPassword(demoPassword);
            await database.SaveChangesAsync();
        }

        // 4. Demo Doctors and Patients
        var demoDoctors = new[]
        {
            (Username: "dr.ana", Name: "Dra. Ana Costa", Doc: "81000000184", CRM: "CRM-SP-70001", Esp: "Cardiologia", Patients: new[] { ("Mariana Alves", "82000000100"), ("Roberto Martins", "82000000282") }),
            (Username: "dr.bruno", Name: "Dr. Bruno Lima", Doc: "81000000265", CRM: "CRM-SP-70002", Esp: "Pediatria", Patients: new[] { ("Lucas Ferreira", "82000000363"), ("Sofia Almeida", "82000000444") }),
            (Username: "dra.carla", Name: "Dra. Carla Mendes", Doc: "81000000346", CRM: "CRM-SP-70003", Esp: "Ortopedia", Patients: new[] { ("Paulo Henrique", "82000000525"), ("Renata Souza", "82000000606") }),
            (Username: "dr.diego", Name: "Dr. Diego Rocha", Doc: "81000000427", CRM: "CRM-SP-70004", Esp: "Radiologia", Patients: new[] { ("Camila Ribeiro", "82000000797"), ("Eduardo Gomes", "82000000878") }),
            (Username: "dra.elisa", Name: "Dra. Elisa Nogueira", Doc: "81000000508", CRM: "CRM-SP-70005", Esp: "Neurologia", Patients: new[] { ("Fernanda Castro", "82000000959"), ("Gustavo Pereira", "82000001092") })
        };

        foreach (var docInfo in demoDoctors)
        {
            var user = await database.Users.FirstOrDefaultAsync(u => u.Username == docInfo.Username);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = docInfo.Username,
                    Role = UserRole.Medico,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                user.SetPassword(demoPassword);
                database.Users.Add(user);
                await database.SaveChangesAsync();
            }
            else if (normalizePasswords)
            {
                user.SetPassword(demoPassword);
                await database.SaveChangesAsync();
            }

            var medico = await database.Medicos.FirstOrDefaultAsync(m => m.UserId == user.Id || m.Documento == docInfo.Doc);
            var espNav = await database.Especialidades.FirstOrDefaultAsync(e => e.Nome == docInfo.Esp);

            if (medico == null)
            {
                medico = new Medico
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Nome = docInfo.Name,
                    Documento = docInfo.Doc,
                    CRM = docInfo.CRM,
                    Especialidade = docInfo.Esp,
                    EspecialidadeId = espNav?.Id,
                    DataNascimento = DateTime.Parse("1982-05-15"),
                    Telefone = "(11) 98888-7777",
                    Email = $"{docInfo.Username}@healthcore.com",
                    Endereco = "Av. Paulista, 1000 - São Paulo/SP",
                    DataCriacao = DateTime.UtcNow
                };
                database.Medicos.Add(medico);
                await database.SaveChangesAsync();
            }

            foreach (var pInfo in docInfo.Patients)
            {
                var patient = await database.Pacientes.FirstOrDefaultAsync(p => p.Documento == pInfo.Item2);
                if (patient == null)
                {
                    patient = new Paciente
                    {
                        Id = Guid.NewGuid(),
                        MedicoId = medico.Id,
                        Nome = pInfo.Item1,
                        Documento = pInfo.Item2,
                        DataNascimento = DateTime.Parse("1990-03-20"),
                        DataCriacao = DateTime.UtcNow
                    };
                    database.Pacientes.Add(patient);
                    await database.SaveChangesAsync();

                    database.Exames.Add(new Exame
                    {
                        Id = Guid.NewGuid(),
                        PacienteId = patient.Id,
                        Modalidade = ModalidadeExame.DX,
                        IdempotencyKey = Guid.NewGuid().ToString(),
                        DataCriacao = DateTime.UtcNow
                    });
                }
            }
        }

        await database.SaveChangesAsync();
    }

    private static void EnsureBillingSchema(this HealthCoreDbContext database)
    {
        database.Database.ExecuteSqlRaw("""
            CREATE TABLE IF NOT EXISTS "MedicoSubscriptions" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_MedicoSubscriptions" PRIMARY KEY,
                "MedicoId" TEXT NOT NULL,
                "BillingCycle" INTEGER NOT NULL,
                "PaymentMethod" INTEGER NOT NULL,
                "Status" INTEGER NOT NULL,
                "MonthlyAmount" TEXT NOT NULL DEFAULT '49.0',
                "AnnualAmount" TEXT NOT NULL DEFAULT '490.0',
                "TrialStartedAt" TEXT NOT NULL,
                "TrialEndsAt" TEXT NOT NULL,
                "LastPaymentAt" TEXT NULL,
                "NextDueDate" TEXT NULL,
                "SuspendedAt" TEXT NULL,
                "ReactivatedAt" TEXT NULL,
                "Notes" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_MedicoSubscriptions_Medicos_MedicoId"
                    FOREIGN KEY ("MedicoId") REFERENCES "Medicos" ("Id") ON DELETE CASCADE
            );
            """);

        database.Database.ExecuteSqlRaw("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_MedicoSubscriptions_MedicoId"
            ON "MedicoSubscriptions" ("MedicoId");
            """);

        database.Database.ExecuteSqlRaw("""
            INSERT INTO "MedicoSubscriptions" (
                "Id",
                "MedicoId",
                "BillingCycle",
                "PaymentMethod",
                "Status",
                "MonthlyAmount",
                "AnnualAmount",
                "TrialStartedAt",
                "TrialEndsAt",
                "Notes",
                "CreatedAt",
                "UpdatedAt"
            )
            SELECT
                lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
                "Id",
                1,
                1,
                1,
                '49.0',
                '490.0',
                datetime('now'),
                datetime('now', '+30 days'),
                'Teste gratuito criado automaticamente para medico existente.',
                datetime('now'),
                datetime('now')
            FROM "Medicos"
            WHERE NOT EXISTS (
                SELECT 1
                FROM "MedicoSubscriptions"
                WHERE "MedicoSubscriptions"."MedicoId" = "Medicos"."Id"
            );
            """);
    }
}