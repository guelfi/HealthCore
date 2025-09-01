import { apiClient } from '../../infrastructure/api/client';
import type {
  Paciente,
  CreatePacienteDto,
  UpdatePacienteDto,
  PacienteListResponse,
} from '../../domain/entities/Paciente';

// Debug discreto para serviços - só console.log
const debug = {
  log: (message: string, data?: unknown) => {
    console.log(`🔗 [PacienteService] ${message}`, data);
  },
};

export interface PacienteQueryParams {
  page?: number;
  pageSize?: number;
  nome?: string;
  documento?: string;
}

export class PacienteService {
  /**
   * Lista pacientes com paginação e filtros
   */
  static async list(
    params: PacienteQueryParams = {}
  ): Promise<PacienteListResponse> {
    debug.log('Iniciando list() com parâmetros:', params);

    const { page = 1, pageSize = 7, nome, documento } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (nome) {
      searchParams.append('nome', nome);
    }

    if (documento) {
      searchParams.append('documento', documento);
    }

    const fullUrl = `/pacientes?${searchParams.toString()}`;
    debug.log('URL completa da requisição:', fullUrl);
    debug.log('Base URL do apiClient:', apiClient.defaults.baseURL);
    debug.log('URL final será:', `${apiClient.defaults.baseURL}${fullUrl}`);

    try {
      const response = await apiClient.get(fullUrl);

      debug.log('Status da resposta:', response.status);
      debug.log('Dados recebidos:', {
        tipo: Array.isArray(response.data) ? 'Array' : 'Object',
        quantidade: Array.isArray(response.data) ? response.data.length : 'N/A',
        data: response.data,
      });

      // Verificar se a API retorna a nova estrutura paginada ou a antiga
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data
      ) {
        // Nova estrutura paginada - usar diretamente
        debug.log('Usando nova estrutura paginada da API');
        return response.data as PacienteListResponse;
      } else {
        // Estrutura antiga (array simples) - converter para nova estrutura
        debug.log('Convertendo estrutura antiga para nova estrutura paginada');
        const pacientesArray = response.data as Paciente[];

        const result = {
          data: pacientesArray,
          total: pacientesArray.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(pacientesArray.length / pageSize),
        };

        debug.log('Resultado final (convertido):', result);
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined;
      debug.log('Erro na requisição:', {
        message: errorMessage,
        status: errorResponse?.status,
        statusText: errorResponse?.statusText,
        data: errorResponse?.data,
      });
      throw error;
    }
  }

  /**
   * Busca um paciente por ID
   */
  static async getById(id: string): Promise<Paciente> {
    const response = await apiClient.get(`/pacientes/${id}`);
    return response.data;
  }

  /**
   * Cria um novo paciente
   */
  static async create(data: CreatePacienteDto): Promise<Paciente> {
    // Converter dados para o formato esperado pelo backend
    const pacienteData = {
      nome: data.nome,
      documento: data.documento, // Backend espera 'documento', não 'cpf'
      dataNascimento:
        data.dataNascimento instanceof Date
          ? data.dataNascimento.toISOString()
          : new Date(data.dataNascimento).toISOString(),
      telefone: data.telefone || null,
      email: data.email || null,
      endereco: data.endereco || null,
    };

    const response = await apiClient.post('/pacientes', pacienteData);
    return response.data;
  }

  /**
   * Atualiza um paciente existente
   */
  static async update(id: string, data: UpdatePacienteDto): Promise<Paciente> {
    // Converter dados para o formato esperado pelo backend
    const updateData: UpdatePacienteDto & { dataNascimento?: string } = {
      nome: data.nome,
      documento: data.documento, // Backend espera 'documento'
      telefone: data.telefone || null,
      email: data.email || null,
      endereco: data.endereco || null,
    };

    if (data.dataNascimento) {
      updateData.dataNascimento =
        data.dataNascimento instanceof Date
          ? data.dataNascimento.toISOString()
          : new Date(data.dataNascimento).toISOString();
    }

    const response = await apiClient.put(`/pacientes/${id}`, updateData);
    return response.data;
  }

  /**
   * Remove um paciente
   */
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/pacientes/${id}`);
  }

  /**
   * Busca pacientes por nome
   */
  static async searchByName(nome: string): Promise<Paciente[]> {
    const response = await apiClient.get(
      `/pacientes/search?nome=${encodeURIComponent(nome)}`
    );
    return response.data;
  }
}
