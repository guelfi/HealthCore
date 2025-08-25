export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePacienteDto {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface UpdatePacienteDto {
  nome?: string;
  cpf?: string;
  dataNascimento?: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface PacienteListResponse {
  data: Paciente[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}