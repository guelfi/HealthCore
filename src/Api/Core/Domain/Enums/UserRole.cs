using System.ComponentModel;

namespace HealthCore.Api.Core.Domain.Enums
{
    public enum UserRole
    {
        [Description("Administrador")]
        Administrador = 1,
        
        [Description("Médico")]
        Medico = 2
    }
}