import axios from 'axios';
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { apiConfig } from '../utils/apiConfig';

// Configuração dinâmica da API
const API_BASE_URL = apiConfig.getBaseUrl();
const API_TIMEOUT = apiConfig.getTimeout();

// Log da configuração para debug
console.log('🔧 Configuração da API:', {
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  debugInfo: apiConfig.getDebugInfo()
});

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
    console.log('🚀 Fazendo requisição:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`
    });

    // Obter token do Zustand store
    try {
      const authStore = JSON.parse(localStorage.getItem('auth-store') || '{}');
      const token = authStore?.state?.token;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token adicionado à requisição');
      } else {
        console.log('ℹ️ Requisição sem token');
      }
    } catch (error) {
      console.warn('Erro ao obter token do auth store:', error);
    }

    return config;
  },
  error => {
    console.error('❌ Erro no interceptador de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratamento de erros e refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url
    });
    return response;
  },
  async error => {
    console.log('⚠️ Erro na resposta:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'Sem resposta',
      request: error.request ? 'Request feito' : 'Sem request',
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });
    const originalRequest = error.config;

    // Tratamento de erro 401 (Unauthorized) - Token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar refresh token
        const authStore = JSON.parse(
          localStorage.getItem('auth-store') || '{}'
        );
        const refreshToken = authStore?.state?.refreshToken;

        if (refreshToken) {
          // Fazer chamada para refresh token
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          // Atualizar tokens no store
          const newAuthState = {
            ...authStore,
            state: {
              ...authStore.state,
              token: refreshResponse.data.token,
              refreshToken: refreshResponse.data.refreshToken || refreshToken,
            },
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
      console.error('❌ Erro de rede detectado:', {
        message: error.message,
        code: error.code,
        request: !!error.request,
        stack: error.stack
      });
      const networkError = new Error('Erro de conectividade: Verifique sua conexão com a internet ou se a API está disponível');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    // Tratamento de erro 401 sem retry (usuário não autenticado)
    if (error.response?.status === 401 && originalRequest._retry) {
      console.error('Falha na autenticação: Token inválido ou expirado');
      const authError = new Error('Sessão expirada. Faça login novamente.');
      authError.name = 'AuthenticationError';
      return Promise.reject(authError);
    }

    // Tratamento de outros erros da API
    if (error.response?.status >= 500) {
      console.error('Erro interno do servidor:', error.response.data);
      const serverError = new Error('Erro interno do servidor. Tente novamente mais tarde.');
      serverError.name = 'ServerError';
      return Promise.reject(serverError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
