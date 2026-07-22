import { apiClient } from '../../infrastructure/api/client';
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from '../../domain/entities/Usuario';
import { UserProfile } from '../../domain/enums/UserProfile';

interface ErrorResponse {
  response?: {
    status: number;
    statusText?: string;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}

// Diagnostic calls are intentionally no-op in production code.
const debug = { log: (..._args: unknown[]) => undefined };

export interface UsuarioQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  role?: UserProfile;
  isActive?: boolean;
}

export interface UsuarioListResponse {
  data: Usuario[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class UsuarioService {
  /**
   * Lista usuários com paginação e filtros
   */
  static async list(
    params: UsuarioQueryParams = {}
  ): Promise<UsuarioListResponse> {
    debug.log('Iniciando list() com parâmetros:', params);

    const { page = 1, pageSize = 7, username, role, isActive } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (username) {
      searchParams.append('username', username);
    }

    if (role !== undefined) {
      searchParams.append('role', role.toString());
    }

    if (isActive !== undefined) {
      searchParams.append('isActive', isActive.toString());
    }

    const fullUrl = `/users?${searchParams.toString()}`;
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
        return response.data as UsuarioListResponse;
      } else {
        // Estrutura antiga (array simples) - converter para nova estrutura
        debug.log('Convertendo estrutura antiga para nova estrutura paginada');
        const usuariosArray = response.data as Usuario[];

        const result = {
          data: usuariosArray,
          total: usuariosArray.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(usuariosArray.length / pageSize),
        };

        debug.log('Resultado final (convertido):', result);
        return result;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorResponse = error && typeof error === 'object' && 'response' in error ? (error as ErrorResponse).response : undefined;
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
   * Busca um usuário por ID
   */
  static async getById(id: string): Promise<Usuario> {
    debug.log('Buscando usuário por ID:', id);
    const response = await apiClient.get(`/users/${id}`);
    debug.log('Usuário encontrado:', response.data);
    return response.data;
  }

  /**
   * Cria um novo usuário
   */
  static async create(data: CreateUsuarioDto): Promise<Usuario> {
    debug.log('Criando usuário:', data);
    
    // Converter dados para o formato esperado pelo backend
    const usuarioData = {
      username: data.username,
      password: data.password,
      role: data.role, // Enum será convertido para número
    };

    debug.log('Dados formatados para backend:', usuarioData);
    const response = await apiClient.post('/users', usuarioData);
    debug.log('Usuário criado:', response.data);
    return response.data;
  }

  /**
   * Atualiza um usuário existente
   */
  static async update(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
    debug.log('Atualizando usuário:', { id, data });
    
    // Converter dados para o formato esperado pelo backend
    const updateData: Partial<UpdateUsuarioDto> = {};
    
    if (data.username !== undefined) {
      updateData.username = data.username;
    }
    
    if (data.password !== undefined) {
      updateData.password = data.password;
    }
    
    if (data.role !== undefined) {
      updateData.role = data.role;
    }
    
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    debug.log('Dados formatados para backend:', updateData);
    const response = await apiClient.put(`/users/${id}`, updateData);
    debug.log('Usuário atualizado:', response.data);
    return response.data;
  }

  /**
   * Remove um usuário
   */
  static async delete(id: string): Promise<void> {
    debug.log('Removendo usuário:', id);
    await apiClient.delete(`/users/${id}`);
    debug.log('Usuário removido com sucesso');
  }

  /**
   * Ativa um usuário
   */
  static async activate(id: string): Promise<Usuario> {
    debug.log('Ativando usuário:', id);
    const response = await apiClient.patch(`/admin/usuarios/${id}/ativar`);
    debug.log('Usuário ativado:', response.data);
    return response.data;
  }

  /**
   * Desativa um usuário (usando DELETE que desativa)
   */
  static async deactivate(id: string): Promise<Usuario> {
    debug.log('Desativando usuário:', id);
    const response = await apiClient.delete(`/admin/usuarios/${id}`);
    debug.log('Usuário desativado:', response.data);
    return response.data;
  }

  /**
   * Busca usuários por username
   */
  static async searchByUsername(username: string): Promise<Usuario[]> {
    debug.log('Buscando usuários por username:', username);
    const response = await apiClient.get(
      `/users/search?username=${encodeURIComponent(username)}`
    );
    debug.log('Usuários encontrados:', response.data);
    return response.data;
  }

  /**
   * Lista usuários por role
   */
  static async getByRole(
    role: UserProfile,
    params: Omit<UsuarioQueryParams, 'role'> = {}
  ): Promise<UsuarioListResponse> {
    debug.log('Buscando usuários por role:', role);
    return this.list({ ...params, role });
  }

  /**
   * Lista apenas usuários ativos
   */
  static async getActiveUsers(
    params: Omit<UsuarioQueryParams, 'isActive'> = {}
  ): Promise<UsuarioListResponse> {
    debug.log('Buscando usuários ativos');
    return this.list({ ...params, isActive: true });
  }

  /**
   * Lista apenas usuários inativos
   */
  static async getInactiveUsers(
    params: Omit<UsuarioQueryParams, 'isActive'> = {}
  ): Promise<UsuarioListResponse> {
    debug.log('Buscando usuários inativos');
    return this.list({ ...params, isActive: false });
  }
}