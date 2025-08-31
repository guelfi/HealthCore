import { ModalidadeDicom } from '../enums/ModalidadeDicom';
import type { Paciente } from './Paciente';

export interface Exame {
  id: string;
  pacienteId: string;
  paciente?: Paciente;
  modalidade: ModalidadeDicom;
  descricao?: string;
  dataExame: Date;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExameDto {
  pacienteId: string;
  modalidade: ModalidadeDicom;
  descricao?: string;
  dataExame: Date;
  idempotencyKey?: string;
}

export interface UpdateExameDto {
  pacienteId?: string;
  modalidade?: ModalidadeDicom;
  descricao?: string;
  dataExame?: Date;
}

export interface ExameListResponse {
  data: Exame[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
