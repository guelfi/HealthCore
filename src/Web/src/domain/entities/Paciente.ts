export interface Paciente {
  id: string;
  nome: string;
  documento: string; // Mudança: era 'cpf', agora 'documento' para corresponder ao backend
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePacienteDto {
  nome: string;
  documento: string; // Mudança: era 'cpf', agora 'documento' para corresponder ao backend
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface UpdatePacienteDto {
  nome?: string;
  documento?: string; // Mudança: era 'cpf', agora 'documento' para corresponder ao backend
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
