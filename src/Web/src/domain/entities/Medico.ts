export interface Medico {
  id: string;
  userId: string;
  nome: string;
  documento: string; // CPF
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  crm: string;
  especialidade?: string;
  dataCriacao: Date;
  username?: string;
  isActive: boolean;
  userCreatedAt: Date;
}

export interface CreateMedicoDto {
  nome: string;
  documento: string; // CPF
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  crm: string;
  especialidade?: string;
  username: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateMedicoDto {
  nome?: string;
  documento?: string; // CPF
  dataNascimento?: Date;
  telefone?: string;
  email?: string;
  endereco?: string;
  crm?: string;
  especialidade?: string;
  username?: string;
  isActive?: boolean;
}

export interface MedicoListResponse {
  data: Medico[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MedicoQueryParams {
  page?: number;
  pageSize?: number;
  nome?: string;
  crm?: string;
  especialidade?: string;
  isActive?: boolean;
}