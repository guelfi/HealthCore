import axios from 'axios';
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { apiConfig } from '../utils/apiConfig';
import { clearSession, getAccessToken, setSession } from './authSession';

const API_BASE_URL = apiConfig.getBaseUrl();
const API_TIMEOUT = apiConfig.getTimeout();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }

    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      getAccessToken()
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          API_BASE_URL + '/auth/refresh',
          {},
          { timeout: API_TIMEOUT, withCredentials: true }
        );

        setSession(refreshResponse.data.token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization =
            'Bearer ' + refreshResponse.data.token;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearSession();
        localStorage.removeItem('auth-store');
        window.location.href = import.meta.env.BASE_URL + 'login';
        return Promise.reject(refreshError);
      }
    }

    if (!error.response) {
      const networkError = new Error(
        'Erro de conectividade: Verifique sua conexão com a internet ou se a API está disponível'
      );
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    if (error.response.status === 401 && originalRequest?._retry) {
      const authError = new Error('Sessão expirada. Faça login novamente.');
      authError.name = 'AuthenticationError';
      return Promise.reject(authError);
    }

    if (error.response.status >= 500) {
      const serverError = new Error(
        'Erro interno do servidor. Tente novamente mais tarde.'
      );
      serverError.name = 'ServerError';
      return Promise.reject(serverError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;