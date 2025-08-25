import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, LoginDto, AuthResponse } from '../../domain/entities/Usuario';

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

// Mock data for development
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    role: 'Administrador' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    username: 'medico1',
    role: 'Médico' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockLogin = async (credentials: LoginDto): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.username === credentials.username);
  
  if (!user || credentials.password !== '123456') {
    throw new Error('Credenciais inválidas');
  }
  
  return {
    token: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    user,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
};

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
          const response = await mockLogin(credentials);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        set({ isLoading: true });
        
        try {
          // Mock refresh token logic
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newToken = 'mock-jwt-token-refreshed-' + Date.now();
          
          set({
            token: newToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Falha ao renovar sessão',
          });
          get().logout();
          throw error;
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;