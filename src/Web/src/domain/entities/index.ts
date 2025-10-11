// Explicit exports to avoid circular dependencies
export type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  LoginDto,
  AuthResponse,
} from './Usuario';
export type {
  Paciente,
  CreatePacienteDto,
  UpdatePacienteDto,
  PacienteListResponse,
} from './Paciente';
export type {
  Exame,
  CreateExameDto,
  UpdateExameDto,
  ExameListResponse,
} from './Exame';
export type {
  Medico,
  CreateMedicoDto,
  UpdateMedicoDto,
  MedicoListResponse,
  MedicoQueryParams,
} from './Medico';
export type {
  DashboardMetrics,
  UsuarioMetrics,
  PacienteMetrics,
  ExameMetrics,
  CrescimentoMetrics,
} from './Metrics';
export type {
  Especialidade,
  CreateEspecialidadeDto,
  UpdateEspecialidadeDto,
  PaginatedEspecialidades,
  EspecialidadeFilter,
} from './Especialidade';
