import { apiClient } from '../../infrastructure/api/client';
import type { 
  Especialidade, 
  CreateEspecialidadeDto, 
  UpdateEspecialidadeDto, 
  PaginatedEspecialidades,
  EspecialidadeFilter 
} from '../../domain/entities';

export class EspecialidadeService {
  private static readonly BASE_URL = '/api/especialidades';

  /**
   * Busca especialidades com paginação e filtros
   */
  static async getEspecialidades(filter: EspecialidadeFilter = {}): Promise<PaginatedEspecialidades> {
    const params = new URLSearchParams();
    
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());
    if (filter.ativa !== undefined) params.append('ativa', filter.ativa.toString());
    if (filter.search) params.append('search', filter.search);

    const response = await apiClient.get<PaginatedEspecialidades>(`${this.BASE_URL}?${params.toString()}`);
    return response.data;
  }

  /**
   * Busca especialidade por ID
   */
  static async getEspecialidadeById(id: string): Promise<Especialidade> {
    const response = await apiClient.get<Especialidade>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Cria nova especialidade
   */
  static async createEspecialidade(dto: CreateEspecialidadeDto): Promise<Especialidade> {
    const response = await apiClient.post<Especialidade>(this.BASE_URL, dto);
    return response.data;
  }

  /**
   * Atualiza especialidade existente
   */
  static async updateEspecialidade(id: string, dto: UpdateEspecialidadeDto): Promise<Especialidade> {
    const response = await apiClient.put<Especialidade>(`${this.BASE_URL}/${id}`, dto);
    return response.data;
  }

  /**
   * Exclui especialidade
   */
  static async deleteEspecialidade(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Busca especialidades ativas (para dropdowns)
   */
  static async getEspecialidadesAtivas(): Promise<Especialidade[]> {
    const response = await this.getEspecialidades({ 
      ativa: true, 
      pageSize: 1000 // Buscar todas as ativas
    });
    return response.items;
  }
}

export default EspecialidadeService;
