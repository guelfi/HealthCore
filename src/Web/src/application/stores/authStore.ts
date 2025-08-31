import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Usuario,
  LoginDto,
  AuthResponse,
} from '../../domain/entities/Usuario';
import { UserProfile } from '../../domain/enums/UserProfile';
import { apiClient } from '../../infrastructure/api/client';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  setUser: (user: Usuario) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/auth/login', credentials);
          const authData: AuthResponse = response.data;

          // Converter dados do backend para formato frontend
          const user: Usuario = {
            id: authData.user.id,
            username: authData.user.username,
            role: authData.user.role as UserProfile, // Converter número para UserProfile
            isActive: authData.user.isActive,
          };

          // const expiresAt = typeof authData.expiresAt === 'string'
          //   ? new Date(authData.expiresAt)
          //   : authData.expiresAt; // Removido: não utilizado

          set({
            user,
            token: authData.token,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Erro de autenticação';

          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        const { token } = get();

        try {
          if (token) {
            // Fazer logout na API para invalidar o token
            await apiClient.post('/auth/logout');
          }
        } catch (error) {
          console.warn('Erro ao fazer logout na API:', error);
          // Mesmo com erro na API, limpar dados locais
        } finally {
          // Sempre limpar dados locais
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('Token de atualização não disponível');
        }

        set({ isLoading: true });

        try {
          const response = await apiClient.post('/auth/refresh', {
            refreshToken,
          });

          const authData = response.data;

          set({
            token: authData.token,
            refreshToken: authData.refreshToken || refreshToken, // Manter o mesmo se não retornar um novo
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Falha ao renovar sessão';

          set({
            isLoading: false,
            error: errorMessage,
          });

          // Se falhar o refresh, fazer logout
          get().logout();
          throw new Error(errorMessage);
        }
      },

      setUser: (user: Usuario) => set({ user }),

      setTokens: (token: string, refreshToken: string) =>
        set({ token, refreshToken }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
