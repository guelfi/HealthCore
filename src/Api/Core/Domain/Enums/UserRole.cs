using System.ComponentModel;

namespace MobileMed.Api.Core.Domain.Enums
{
    public enum UserRole
    {
        [Description("Administrador")]
        Administrador = 1,
        
        [Description("Médico")]
        Medico = 2
    }
}