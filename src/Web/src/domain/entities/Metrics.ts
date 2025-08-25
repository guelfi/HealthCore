export interface UsuarioMetrics {
  totalUsuarios: number;
  usuariosPorPerfil: {
    administradores: number;
    medicos: number;
  };
  usuariosAtivos: number;
  usuariosInativos: number;
}

export interface PacienteMetrics {
  totalPacientes: number;
  pacientesPorMedico: Array<{
    medicoId: string;
    medicoUsername: string;
    totalPacientes: number;
  }>;
  novosUltimos30Dias: number;
}

export interface ExameMetrics {
  totalExames: number;
  examesPorModalidade: Array<{
    modalidade: string;
    total: number;
  }>;
  examesPorPeriodo: Array<{
    periodo: string;
    total: number;
  }>;
  examesUltimos30Dias: number;
}

export interface CrescimentoMetrics {
  usuarios: Array<{
    mes: string;
    total: number;
  }>;
  pacientes: Array<{
    mes: string;
    total: number;
  }>;
  exames: Array<{
    mes: string;
    total: number;
  }>;
}

export interface DashboardMetrics {
  usuarios: UsuarioMetrics;
  pacientes: PacienteMetrics;
  exames: ExameMetrics;
  crescimento: CrescimentoMetrics;
}