import { apiClient } from '../../infrastructure/api/client';
import type { 
  Paciente, 
  CreatePacienteDto, 
  UpdatePacienteDto, 
  PacienteListResponse 
} from '../../domain/entities/Paciente';

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
  static async list(params: PacienteQueryParams = {}): Promise<PacienteListResponse> {
    const { page = 1, pageSize = 10, nome, documento } = params;
    
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
    
    const response = await apiClient.get(`/pacientes?${searchParams.toString()}`);
    return response.data;
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
    // Converter CPF para documento para corresponder com o backend
    const pacienteData = {
      ...data,
      documento: data.cpf,
      dataNascimento: data.dataNascimento.toISOString(),
    };
    
    // Remover cpf do objeto já que usamos documento
    const { cpf, ...requestData } = pacienteData;
    
    const response = await apiClient.post('/pacientes', requestData);
    return response.data;
  }

  /**
   * Atualiza um paciente existente
   */
  static async update(id: string, data: UpdatePacienteDto): Promise<Paciente> {
    // Converter CPF para documento se fornecido
    const updateData: any = { ...data };
    
    if (data.cpf) {
      updateData.documento = data.cpf;
      delete updateData.cpf;
    }
    
    if (data.dataNascimento) {
      updateData.dataNascimento = data.dataNascimento.toISOString();
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
   * Busca pacientes por nome (para autocomplete)
   */
  static async searchByName(nome: string): Promise<Paciente[]> {
    const response = await apiClient.get(`/pacientes/search?nome=${encodeURIComponent(nome)}`);
    return response.data;
  }
}

export default PacienteService;