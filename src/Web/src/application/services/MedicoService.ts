import { apiClient } from '../../infrastructure/api/client';
import type {
  Medico,
  CreateMedicoDto,
  UpdateMedicoDto,
  MedicoListResponse,
  MedicoQueryParams,
} from '../../domain/entities/Medico';

// Debug discreto para serviços - só console.log
const debug = {
  log: (message: string, data?: unknown) => {
    console.log(`🔗 [MedicoService] ${message}`, data);
  },
};

export class MedicoService {
  /**
   * Lista médicos com paginação e filtros
   */
  static async list(
    params: MedicoQueryParams = {}
  ): Promise<MedicoListResponse> {
    debug.log('Iniciando list() com parâmetros:', params);

    const { page = 1, pageSize = 7, nome, crm, especialidade, isActive } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (nome) {
      searchParams.append('nome', nome);
    }

    if (crm) {
      searchParams.append('crm', crm);
    }

    if (especialidade) {
      searchParams.append('especialidade', especialidade);
    }

    if (isActive !== undefined) {
      searchParams.append('isActive', isActive.toString());
    }

    const fullUrl = `/medicos?${searchParams.toString()}`;
    debug.log('URL completa da requisição:', fullUrl);
    debug.log('Base URL do apiClient:', apiClient.defaults.baseURL);
    debug.log('URL final será:', `${apiClient.defaults.baseURL}${fullUrl}`);

    try {
      const response = await apiClient.get<MedicoListResponse>(fullUrl);
      debug.log('Resposta recebida:', response.data);

      // Converter strings de data para objetos Date
      const medicosComDatas = response.data.data.map(medico => ({
        ...medico,
        dataNascimento: new Date(medico.dataNascimento),
        dataCriacao: new Date(medico.dataCriacao),
        userCreatedAt: new Date(medico.userCreatedAt),
      }));

      const resultado = {
        ...response.data,
        data: medicosComDatas,
      };

      debug.log('Dados processados:', resultado);
      return resultado;
    } catch (error: unknown) {
      debug.log('Erro na requisição:', error);
      
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined;
      if (errorResponse) {
        debug.log('Status do erro:', errorResponse.status);
        debug.log('Dados do erro:', errorResponse.data);
        
        const errorMessage = errorResponse.data?.message || 'Erro ao buscar médicos';
        throw new Error(errorMessage);
      } else if (error.request) {
        debug.log('Erro de rede - sem resposta do servidor');
        throw new Error('Erro de conexão com o servidor');
      } else {
        debug.log('Erro desconhecido:', error.message);
        throw new Error('Erro inesperado ao buscar médicos');
      }
    }
  }

  /**
   * Busca um médico por ID
   */
  static async getById(id: string): Promise<Medico> {
    debug.log('Buscando médico por ID:', id);
    const response = await apiClient.get<Medico>(`/medicos/${id}`);
    
    // Converter strings de data para objetos Date
    const medico = {
      ...response.data,
      dataNascimento: new Date(response.data.dataNascimento),
      dataCriacao: new Date(response.data.dataCriacao),
      userCreatedAt: new Date(response.data.userCreatedAt),
    };
    
    debug.log('Médico encontrado:', medico);
    return medico;
  }

  /**
   * Cria um novo médico
   */
  static async create(data: CreateMedicoDto): Promise<Medico> {
    debug.log('Criando novo médico:', data);
    
    try {
      const response = await apiClient.post<Medico>('/medicos', data);
      
      // Converter strings de data para objetos Date
      const medico = {
        ...response.data,
        dataNascimento: new Date(response.data.dataNascimento),
        dataCriacao: new Date(response.data.dataCriacao),
        userCreatedAt: new Date(response.data.userCreatedAt),
      };
      
      debug.log('Médico criado com sucesso:', medico);
      return medico;
    } catch (error: unknown) {
      debug.log('Erro ao criar médico:', error);
      
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined;
      if (errorResponse?.data?.message) {
        throw new Error(errorResponse.data.message);
      }
      
      throw new Error('Erro ao criar médico');
    }
  }

  /**
   * Atualiza um médico existente
   */
  static async update(id: string, data: UpdateMedicoDto): Promise<Medico> {
    debug.log('Atualizando médico:', { id, data });
    
    try {
      const response = await apiClient.put<Medico>(`/medicos/${id}`, data);
      
      // Converter strings de data para objetos Date
      const medico = {
        ...response.data,
        dataNascimento: new Date(response.data.dataNascimento),
        dataCriacao: new Date(response.data.dataCriacao),
        userCreatedAt: new Date(response.data.userCreatedAt),
      };
      
      debug.log('Médico atualizado com sucesso:', medico);
      return medico;
    } catch (error: unknown) {
      debug.log('Erro ao atualizar médico:', error);
      
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined;
      if (errorResponse?.data?.message) {
        throw new Error(errorResponse.data.message);
      }
      
      throw new Error('Erro ao atualizar médico');
    }
  }

  /**
   * Remove um médico
   */
  static async delete(id: string): Promise<void> {
    debug.log('Removendo médico:', id);
    
    try {
      await apiClient.delete(`/medicos/${id}`);
      debug.log('Médico removido com sucesso');
    } catch (error: unknown) {
      debug.log('Erro ao remover médico:', error);
      
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined;
      if (errorResponse?.data?.message) {
        throw new Error(errorResponse.data.message);
      }
      
      throw new Error('Erro ao remover médico');
    }
  }

  /**
   * Ativa um médico
   */
  static async activate(id: string): Promise<Medico> {
    debug.log('Ativando médico:', id);
    
    try {
      const response = await apiClient.patch<Medico>(`/medicos/${id}/ativar`);
      
      // Converter strings de data para objetos Date
      const medico = {
        ...response.data,
        dataNascimento: new Date(response.data.dataNascimento),
        dataCriacao: new Date(response.data.dataCriacao),
        userCreatedAt: new Date(response.data.userCreatedAt),
      };
      
      debug.log('Médico ativado com sucesso:', medico);
      return medico;
    } catch (error: unknown) {
      debug.log('Erro ao ativar médico:', error);
      
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as any).response : undefined;
      if (errorResponse?.data?.message) {
        throw new Error(errorResponse.data.message);
      }
      
      throw new Error('Erro ao ativar médico');
    }
  }

  /**
   * Busca médicos por nome
   */
  static async searchByName(nome: string): Promise<Medico[]> {
    debug.log('Buscando médicos por nome:', nome);
    
    const response = await this.list({ nome, pageSize: 100 });
    return response.data;
  }

  /**
   * Busca médicos por CRM
   */
  static async searchByCRM(crm: string): Promise<Medico[]> {
    debug.log('Buscando médicos por CRM:', crm);
    
    const response = await this.list({ crm, pageSize: 100 });
    return response.data;
  }

  /**
   * Busca médicos por especialidade
   */
  static async searchByEspecialidade(especialidade: string): Promise<Medico[]> {
    debug.log('Buscando médicos por especialidade:', especialidade);
    
    const response = await this.list({ especialidade, pageSize: 100 });
    return response.data;
  }
}

export { type MedicoQueryParams };