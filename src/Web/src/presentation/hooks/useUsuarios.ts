import { useState, useCallback } from 'react';
import {
  UsuarioService,
  type UsuarioQueryParams,
  type UsuarioListResponse,
} from '../../application/services/UsuarioService';
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from '../../domain/entities/Usuario';
import { getApiErrorResponse, getErrorMessage } from '../../infrastructure/utils/errorMessage';
import { UserProfile } from '../../domain/enums/UserProfile';

// Debug discreto para hooks - só console.log
const debug = {
  log: (..._args: unknown[]) => undefined,
  info: (..._args: unknown[]) => undefined,
  error: (..._args: unknown[]) => undefined,
};

interface UseUsuariosState {
  usuarios: Usuario[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface UseUsuariosActions {
  fetchUsuarios: (params?: UsuarioQueryParams) => Promise<void>;
  createUsuario: (data: CreateUsuarioDto) => Promise<Usuario>;
  updateUsuario: (id: string, data: UpdateUsuarioDto) => Promise<Usuario>;
  deleteUsuario: (id: string) => Promise<void>;
  activateUsuario: (id: string) => Promise<Usuario>;
  deactivateUsuario: (id: string) => Promise<Usuario>;
  getUsuarioById: (id: string) => Promise<Usuario>;
  searchUsuarios: (username: string) => Promise<Usuario[]>;
  getUsuariosByRole: (role: UserProfile, params?: Omit<UsuarioQueryParams, 'role'>) => Promise<void>;
  getActiveUsuarios: (params?: Omit<UsuarioQueryParams, 'isActive'>) => Promise<void>;
  getInactiveUsuarios: (params?: Omit<UsuarioQueryParams, 'isActive'>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUsuarios = (): UseUsuariosState & UseUsuariosActions => {
  const [state, setState] = useState<UseUsuariosState>({
    usuarios: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const fetchUsuarios = useCallback(
    async (params: UsuarioQueryParams = {}) => {
      debug.log('Iniciando fetchUsuarios com:', params);
      setLoading(true);
      clearError();

      try {
        debug.log('Chamando UsuarioService.list...');
        const response: UsuarioListResponse =
          await UsuarioService.list(params);
        debug.log('Resposta recebida:', response);

        setState(prev => ({
          ...prev,
          usuarios: Array.isArray(response.data) ? response.data : [],
          total: response.total,
          currentPage: response.page,
          totalPages: response.totalPages,
          loading: false,
        }));

        debug.log('Estado atualizado - usuários:', response.data.length);
      } catch (error: unknown) {
        const errorResponse = getApiErrorResponse(error);
        const errorMessage = getErrorMessage(error, 'Erro desconhecido');
        debug.log('Erro ao buscar usuários:', {
          message: errorMessage,
          status: errorResponse?.status,
          statusText: errorResponse?.statusText,
          data: errorResponse?.data,
        });
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
      }
    },
    [clearError, setError, setLoading]
  );

  const createUsuario = useCallback(
    async (data: CreateUsuarioDto): Promise<Usuario> => {
      debug.log('Criando usuário:', data);
      setLoading(true);
      clearError();

      try {
        const usuario = await UsuarioService.create(data);
        debug.log('Usuário criado:', usuario);

        // Atualizar lista local
        setState(prev => ({
          ...prev,
          usuarios: [usuario, ...prev.usuarios],
          total: prev.total + 1,
          loading: false,
        }));

        return usuario;
      } catch (error: unknown) {
        debug.log('Erro ao criar usuário:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const updateUsuario = useCallback(
    async (id: string, data: UpdateUsuarioDto): Promise<Usuario> => {
      debug.log('Atualizando usuário:', { id, data });
      setLoading(true);
      clearError();

      try {
        const usuario = await UsuarioService.update(id, data);
        debug.log('Usuário atualizado:', usuario);

        // Atualizar lista local
        setState(prev => ({
          ...prev,
          usuarios: prev.usuarios.map(u => (u.id === id ? usuario : u)),
          loading: false,
        }));

        return usuario;
      } catch (error: unknown) {
        debug.log('Erro ao atualizar usuário:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const deleteUsuario = useCallback(
    async (id: string): Promise<void> => {
      debug.log('Removendo usuário:', id);
      setLoading(true);
      clearError();

      try {
        await UsuarioService.delete(id);
        debug.log('Usuário removido com sucesso');

        // Remover da lista local
        setState(prev => ({
          ...prev,
          usuarios: prev.usuarios.filter(u => u.id !== id),
          total: prev.total - 1,
          loading: false,
        }));
      } catch (error: unknown) {
        debug.log('Erro ao remover usuário:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const activateUsuario = useCallback(
    async (id: string): Promise<Usuario> => {
      debug.log('Ativando usuário:', id);
      setLoading(true);
      clearError();

      try {
        const usuario = await UsuarioService.activate(id);
        debug.log('Usuário ativado:', usuario);

        // Atualizar lista local
        setState(prev => ({
          ...prev,
          usuarios: prev.usuarios.map(u => (u.id === id ? usuario : u)),
          loading: false,
        }));

        return usuario;
      } catch (error: unknown) {
        debug.log('Erro ao ativar usuário:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const deactivateUsuario = useCallback(
    async (id: string): Promise<Usuario> => {
      debug.log('Desativando usuário:', id);
      setLoading(true);
      clearError();

      try {
        const usuario = await UsuarioService.deactivate(id);
        debug.log('Usuário desativado:', usuario);

        // Atualizar lista local
        setState(prev => ({
          ...prev,
          usuarios: prev.usuarios.map(u => (u.id === id ? usuario : u)),
          loading: false,
        }));

        return usuario;
      } catch (error: unknown) {
        debug.log('Erro ao desativar usuário:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const getUsuarioById = useCallback(
    async (id: string): Promise<Usuario> => {
      debug.log('Buscando usuário por ID:', id);
      setLoading(true);
      clearError();

      try {
        const usuario = await UsuarioService.getById(id);
        debug.log('Usuário encontrado:', usuario);
        setState(prev => ({ ...prev, loading: false }));
        return usuario;
      } catch (error: unknown) {
        debug.log('Erro ao buscar usuário:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const searchUsuarios = useCallback(
    async (username: string): Promise<Usuario[]> => {
      debug.log('Buscando usuários por username:', username);
      setLoading(true);
      clearError();

      try {
        const usuarios = await UsuarioService.searchByUsername(username);
        debug.log('Usuários encontrados:', usuarios);
        setState(prev => ({ ...prev, loading: false }));
        return usuarios;
      } catch (error: unknown) {
        debug.log('Erro ao buscar usuários:', error);
        setError(
          getErrorMessage(error, 'Erro ao processar usuario')
        );
        setState(prev => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [clearError, setError, setLoading]
  );

  const getUsuariosByRole = useCallback(
    async (
      role: UserProfile,
      params: Omit<UsuarioQueryParams, 'role'> = {}
    ): Promise<void> => {
      debug.log('Buscando usuários por role:', role);
      return fetchUsuarios({ ...params, role });
    },
    [fetchUsuarios]
  );

  const getActiveUsuarios = useCallback(
    async (params: Omit<UsuarioQueryParams, 'isActive'> = {}): Promise<void> => {
      debug.log('Buscando usuários ativos');
      return fetchUsuarios({ ...params, isActive: true });
    },
    [fetchUsuarios]
  );

  const getInactiveUsuarios = useCallback(
    async (params: Omit<UsuarioQueryParams, 'isActive'> = {}): Promise<void> => {
      debug.log('Buscando usuários inativos');
      return fetchUsuarios({ ...params, isActive: false });
    },
    [fetchUsuarios]
  );

  return {
    // State
    usuarios: state.usuarios,
    total: state.total,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    // Actions
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    activateUsuario,
    deactivateUsuario,
    getUsuarioById,
    searchUsuarios,
    getUsuariosByRole,
    getActiveUsuarios,
    getInactiveUsuarios,
    clearError,
    setLoading,
  };
};