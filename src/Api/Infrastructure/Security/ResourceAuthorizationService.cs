using System.Security.Claims;
using HealthCore.Api.Core.Domain.Enums;
using HealthCore.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HealthCore.Api.Infrastructure.Security;

public sealed class ResourceAuthorizationService(HealthCoreDbContext context)
{
    private readonly HealthCoreDbContext _context = context;

    public bool IsAdministrator(ClaimsPrincipal user) =>
        user.IsInRole(UserRole.Administrador.ToString());

    public async Task<Guid?> GetCurrentMedicoIdAsync(ClaimsPrincipal user)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return null;
        }

        return await _context.Medicos
            .Where(m => m.UserId == userId)
            .Select(m => (Guid?)m.Id)
            .SingleOrDefaultAsync();
    }

    public async Task<bool> CanAccessPatientAsync(Guid patientId, ClaimsPrincipal user)
    {
        if (IsAdministrator(user))
        {
            return true;
        }

        var medicoId = await GetCurrentMedicoIdAsync(user);
        return medicoId.HasValue && await _context.Pacientes
            .AnyAsync(p => p.Id == patientId && p.MedicoId == medicoId.Value);
    }

    public async Task<bool> CanAccessExamAsync(Guid examId, ClaimsPrincipal user)
    {
        if (IsAdministrator(user))
        {
            return true;
        }

        var medicoId = await GetCurrentMedicoIdAsync(user);
        return medicoId.HasValue && await _context.Exames
            .AnyAsync(e => e.Id == examId && e.Paciente.MedicoId == medicoId.Value);
    }
}
