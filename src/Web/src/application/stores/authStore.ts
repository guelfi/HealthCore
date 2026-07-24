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

type AuthUserPayload = AuthResponse['user'] & {
  Id?: string;
  Username?: string;
  DisplayName?: string;
  Role?: number;
  IsActive?: boolean;
};

type AuthPayload = AuthResponse & {
  Token?: string;
  User?: AuthUserPayload;
};

const buildAuthenticatedUser = (authData: AuthPayload): Usuario => {
  const responseUser = (authData.user ?? authData.User) as AuthUserPayload | undefined;
  const id = responseUser?.id ?? responseUser?.Id;
  const username = responseUser?.username ?? responseUser?.Username;
  const displayName = responseUser?.displayName ?? responseUser?.DisplayName ?? username;
  const role = responseUser?.role ?? responseUser?.Role;
  const isActive = responseUser?.isActive ?? responseUser?.IsActive ?? false;

  if (!id || !username || role === undefined) {
    throw new Error('Resposta de autenticacao invalida. Tente novamente.');
  }

  return {
    id,
    username,
    displayName,
    role: role as UserProfile,
    isActive,
  };
};

const getAuthToken = (authData: AuthPayload): string => {
  const token = authData.token ?? authData.Token;

  if (!token) {
    throw new Error('Token de autenticacao nao recebido. Tente novamente.');
  }

  return token;
};

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
          const authData: AuthPayload = response.data;
          const user = buildAuthenticatedUser(authData);
          const token = getAuthToken(authData);

          setSession(token);
          set({
            user,
            token,
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
            'Erro de autenticacao';

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
          const authData: AuthPayload = response.data;
          const user = buildAuthenticatedUser(authData);
          const token = getAuthToken(authData);

          setSession(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          clearSession();
          const errorMessage =
            error.response?.data?.message || 'Falha ao renovar sessao';

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
