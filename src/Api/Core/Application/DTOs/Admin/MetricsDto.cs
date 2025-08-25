namespace MobileMed.Api.Core.Application.DTOs.Admin
{
    public class AdminMetricsDto
    {
        public int TotalUsuarios { get; set; }
        public int TotalMedicos { get; set; }
        public int TotalAdministradores { get; set; }
        public int TotalPacientes { get; set; }
        public int TotalExames { get; set; }
        public List<PacientesPorMedicoDto> PacientesPorMedico { get; set; } = new();
        public List<CrescimentoDto> CrescimentoBaseDados { get; set; } = new();
        public List<ExamesPorPeriodoDto> ExamesPorPeriodo { get; set; } = new();
    }

    public class PacientesPorMedicoDto
    {
        public string Medico { get; set; } = string.Empty;
        public int Pacientes { get; set; }
    }

    public class CrescimentoDto
    {
        public string Periodo { get; set; } = string.Empty;
        public int NovosUsuarios { get; set; }
        public int NovosPacientes { get; set; }
        public int NovosExames { get; set; }
    }

    public class ExamesPorPeriodoDto
    {
        public string Periodo { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }

    public class MedicoMetricsDto
    {
        public int NumeroPacientes { get; set; }
        public int TotalExames { get; set; }
        public List<ExamesPorPacienteDto> ExamesPorPaciente { get; set; } = new();
        public List<ModalidadeDto> ModalidadesMaisUtilizadas { get; set; } = new();
    }

    public class ExamesPorPacienteDto
    {
        public string Paciente { get; set; } = string.Empty;
        public int Exames { get; set; }
    }

    public class ModalidadeDto
    {
        public string Modalidade { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }
}