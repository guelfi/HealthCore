import type {
  Paciente,
  CreatePacienteDto,
  UpdatePacienteDto,
  PacienteListResponse,
} from '../entities/Paciente';
import type {
  Exame,
  CreateExameDto,
  UpdateExameDto,
  ExameListResponse,
} from '../entities/Exame';
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from '../entities/Usuario';

export interface IPacienteService {
  getAll(
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<PacienteListResponse>;
  getById(id: string): Promise<Paciente>;
  create(data: CreatePacienteDto): Promise<Paciente>;
  update(id: string, data: UpdatePacienteDto): Promise<Paciente>;
  delete(id: string): Promise<void>;
}

export interface IExameService {
  getAll(
    page?: number,
    pageSize?: number,
    pacienteId?: string
  ): Promise<ExameListResponse>;
  getById(id: string): Promise<Exame>;
  create(data: CreateExameDto): Promise<Exame>;
  update(id: string, data: UpdateExameDto): Promise<Exame>;
  delete(id: string): Promise<void>;
}

export interface IUsuarioService {
  getAll(
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<{
    data: Usuario[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
  getById(id: string): Promise<Usuario>;
  create(data: CreateUsuarioDto): Promise<Usuario>;
  update(id: string, data: UpdateUsuarioDto): Promise<Usuario>;
  deactivate(id: string): Promise<void>;
  activate(id: string): Promise<void>;
}
