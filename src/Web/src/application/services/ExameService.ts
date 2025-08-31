import { apiClient } from '../../infrastructure/api/client';
import type { 
  Exame, 
  CreateExameDto, 
  UpdateExameDto, 
  ExameListResponse 
} from '../../domain/entities/Exame';
import { ModalidadeDicom } from '../../domain/enums/ModalidadeDicom';

export interface ExameQueryParams {
  page?: number;
  pageSize?: number;
  pacienteId?: string;
  modalidade?: ModalidadeDicom;
  dataInicio?: Date;
  dataFim?: Date;
}

export class ExameService {
  /**
   * Lista exames com paginação e filtros
   */
  static async list(params: ExameQueryParams = {}): Promise<ExameListResponse> {
    const { page = 1, pageSize = 7, pacienteId, modalidade, dataInicio, dataFim } = params;
    
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (pacienteId) {
      searchParams.append('pacienteId', pacienteId);
    }
    
    if (modalidade) {
      searchParams.append('modalidade', modalidade);
    }
    
    if (dataInicio) {
      searchParams.append('dataInicio', dataInicio.toISOString());
    }
    
    if (dataFim) {
      searchParams.append('dataFim', dataFim.toISOString());
    }
    
    const response = await apiClient.get(`/exames?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * Busca um exame por ID
   */
  static async getById(id: string): Promise<Exame> {
    const response = await apiClient.get(`/exames/${id}`);
    return response.data;
  }

  /**
   * Lista exames de um paciente específico
   */
  static async getByPacienteId(pacienteId: string, params: Omit<ExameQueryParams, 'pacienteId'> = {}): Promise<ExameListResponse> {
    return this.list({ ...params, pacienteId });
  }

  /**
   * Cria um novo exame
   */
  static async create(data: CreateExameDto): Promise<Exame> {
    // Gerar idempotencyKey automaticamente se não fornecida
    const exameData = {
      ...data,
      idempotencyKey: data.idempotencyKey || `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataExame: data.dataExame.toISOString(),
    };
    
    const response = await apiClient.post('/exames', exameData);
    return response.data;
  }

  /**
   * Atualiza um exame existente
   */
  static async update(id: string, data: UpdateExameDto): Promise<Exame> {
    const updateData: any = { ...data };
    
    if (data.dataExame) {
      updateData.dataExame = data.dataExame.toISOString();
    }
    
    const response = await apiClient.put(`/exames/${id}`, updateData);
    return response.data;
  }

  /**
   * Remove um exame
   */
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`/exames/${id}`);
  }

  /**
   * Busca exames por modalidade
   */
  static async getByModalidade(modalidade: ModalidadeDicom, params: Omit<ExameQueryParams, 'modalidade'> = {}): Promise<ExameListResponse> {
    return this.list({ ...params, modalidade });
  }

  /**
   * Busca exames por período
   */
  static async getByPeriodo(dataInicio: Date, dataFim: Date, params: Omit<ExameQueryParams, 'dataInicio' | 'dataFim'> = {}): Promise<ExameListResponse> {
    return this.list({ ...params, dataInicio, dataFim });
  }

  /**
   * Verifica se um exame com a mesma chave de idempotência já existe
   */
  static async checkIdempotency(idempotencyKey: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/exames/check-idempotency/${idempotencyKey}`);
      return response.data.exists;
    } catch (error) {
      // Se o endpoint não existir, assumir que não há duplicata
      return false;
    }
  }

  /**
   * Obtém estatísticas de exames por modalidade
   */
  static async getStatisticsByModalidade(): Promise<{ modalidade: string; count: number }[]> {
    try {
      const response = await apiClient.get('/exames/statistics/modalidade');
      return response.data;
    } catch (error) {
      console.warn('Endpoint de estatísticas não disponível:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de exames por período
   */
  static async getStatisticsByPeriodo(periodo: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{ date: string; count: number }[]> {
    try {
      const response = await apiClient.get(`/exames/statistics/periodo?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      console.warn('Endpoint de estatísticas não disponível:', error);
      return [];
    }
  }
}

export default ExameService;