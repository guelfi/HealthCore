import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Criar instância do Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de requisição para adicionar token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obter token do Zustand store
    try {
      const authStore = JSON.parse(localStorage.getItem('auth-store') || '{}');
      const token = authStore?.state?.token;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao obter token do auth store:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Interceptador de resposta para tratamento de erros e refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Tratamento de erro 401 (Unauthorized) - Token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentar refresh token
        const authStore = JSON.parse(localStorage.getItem('auth-store') || '{}');
        const refreshToken = authStore?.state?.refreshToken;
        
        if (refreshToken) {
          // Fazer chamada para refresh token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          // Atualizar tokens no store
          const newAuthState = {
            ...authStore,
            state: {
              ...authStore.state,
              token: refreshResponse.data.token,
              refreshToken: refreshResponse.data.refreshToken || refreshToken,
            }
          };
          
          localStorage.setItem('auth-store', JSON.stringify(newAuthState));
          
          // Repetir requisição original com novo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError);
        
        // Limpar dados de autenticação e redirecionar para login
        localStorage.removeItem('auth-store');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Tratamento de erro 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('Acesso negado - Permissões insuficientes');
      // Aqui você pode mostrar uma notificação ou redirecionar
    }

    // Tratamento de erro de rede
    if (!error.response) {
      console.error('Erro de rede:', error.message);
      // Aqui você pode mostrar uma notificação de erro de conexão
    }

    // Tratamento de outros erros da API
    if (error.response?.status >= 500) {
      console.error('Erro interno do servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;