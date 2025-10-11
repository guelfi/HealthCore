export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface CreateEspecialidadeDto {
  nome: string;
  descricao?: string;
  ativa: boolean;
}

export interface UpdateEspecialidadeDto {
  nome: string;
  descricao?: string;
  ativa: boolean;
}

export interface PaginatedEspecialidades {
  items: Especialidade[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EspecialidadeFilter {
  page?: number;
  pageSize?: number;
  ativa?: boolean;
  search?: string;
}
