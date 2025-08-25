import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Criar instância do Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de requisição para adicionar token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: Adicionar token JWT quando implementarmos autenticação
    const token = localStorage.getItem('auth-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratamento de erros
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Tratamento de erro 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // TODO: Implementar refresh token quando tivermos autenticação
      // Por enquanto, apenas limpa o token e redireciona para login
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Tratamento de erro 403 (Forbidden)
    if (error.response?.status === 403) {
      // TODO: Mostrar mensagem de acesso negado
      console.error('Acesso negado');
    }

    // Tratamento de erro de rede
    if (!error.response) {
      console.error('Erro de rede:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;