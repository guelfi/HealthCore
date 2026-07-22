import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearSession, setSession } from '../../infrastructure/api/authSession';
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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: Usuario) => void;
  setTokens: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/auth/login', credentials);
          const authData: AuthResponse = response.data;
          const user: Usuario = {
            id: authData.user.id,
            username: authData.user.username,
            role: authData.user.role as UserProfile,
            isActive: authData.user.isActive,
          };

          setSession(authData.token);
          set({
            user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          clearSession();
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
            isAuthenticated: false,
          });

          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          if (get().token) {
            await apiClient.post('/auth/logout');
          }
        } catch {
          // Local session cleanup must not depend on API availability.
        } finally {
          clearSession();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        set({ isLoading: true });

        try {
          const response = await apiClient.post('/auth/refresh', {});
          const authData: AuthResponse = response.data;

          setSession(authData.token);
          set({
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          clearSession();
          const errorMessage =
            error.response?.data?.message || 'Falha ao renovar sessão';

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },

      setUser: (user: Usuario) => set({ user }),
      setTokens: (token: string) => {
        setSession(token);
        set({ token, isAuthenticated: true });
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: state => ({ user: state.user }),
    }
  )
);

export default useAuthStore;