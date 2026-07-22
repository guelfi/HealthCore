using System.Security.Claims;
using FluentAssertions;
using HealthCore.Api.Core.Domain.Entities;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using HealthCore.Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace HealthCore.Api.Tests;

public sealed class ResourceAuthorizationServiceTests : IDisposable
{
    private readonly HealthCoreDbContext _context;
    private readonly ResourceAuthorizationService _authorization;

    public ResourceAuthorizationServiceTests()
    {
        var options = new DbContextOptionsBuilder<HealthCoreDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new HealthCoreDbContext(options);
        _authorization = new ResourceAuthorizationService(_context);
    }

    [Fact]
    public async Task DoctorCanAccessOnlyAssignedPatientAndExams()
    {
        var doctorUserId = Guid.NewGuid();
        var doctorId = Guid.NewGuid();
        var ownPatientId = Guid.NewGuid();
        var foreignPatientId = Guid.NewGuid();
        var ownExamId = Guid.NewGuid();

        await _context.Medicos.AddAsync(new Medico { Id = doctorId, UserId = doctorUserId });
        await _context.Pacientes.AddRangeAsync(
            new Paciente { Id = ownPatientId, MedicoId = doctorId },
            new Paciente { Id = foreignPatientId, MedicoId = Guid.NewGuid() });
        await _context.Exames.AddAsync(new Exame
        {
            Id = ownExamId,
            PacienteId = ownPatientId,
            IdempotencyKey = Guid.NewGuid().ToString()
        });
        await _context.SaveChangesAsync();

        var doctor = Principal(doctorUserId, UserRole.Medico);

        (await _authorization.CanAccessPatientAsync(ownPatientId, doctor)).Should().BeTrue();
        (await _authorization.CanAccessPatientAsync(foreignPatientId, doctor)).Should().BeFalse();
        (await _authorization.CanAccessExamAsync(ownExamId, doctor)).Should().BeTrue();
    }

    [Fact]
    public async Task AdministratorCanAccessAnyResource()
    {
        var patientId = Guid.NewGuid();
        var examId = Guid.NewGuid();
        await _context.Pacientes.AddAsync(new Paciente { Id = patientId });
        await _context.Exames.AddAsync(new Exame
        {
            Id = examId,
            PacienteId = patientId,
            IdempotencyKey = Guid.NewGuid().ToString()
        });
        await _context.SaveChangesAsync();

        var administrator = Principal(Guid.NewGuid(), UserRole.Administrador);

        (await _authorization.CanAccessPatientAsync(patientId, administrator)).Should().BeTrue();
        (await _authorization.CanAccessExamAsync(examId, administrator)).Should().BeTrue();
    }

    public void Dispose() => _context.Dispose();

    private static ClaimsPrincipal Principal(Guid userId, UserRole role) => new(
        new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role.ToString())
        ],
        authenticationType: "test"));
}
