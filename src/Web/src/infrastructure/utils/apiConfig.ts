// Configuração dinâmica da API baseada no ambiente
export class ApiConfig {
  private static instance: ApiConfig;
  private baseUrl: string;
  private timeout: number;

  private constructor() {
    this.baseUrl = this.detectApiUrl();
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  private detectApiUrl(): string {
    // Verificar se está sendo acessado via ngrok
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    const isNgrok =
      currentHost.includes('.ngrok-free.app') ||
      currentHost.includes('.ngrok.io') ||
      currentHost.includes('.ngrok.app');

    // Verificar se está sendo acessado via IP da OCI (produção)
    const isOciProduction = currentHost === '129.153.86.168';

    // Verificar se está sendo acessado via IP da rede local
    const isLocalNetworkAccess = currentHost.startsWith('192.168.') || currentHost.startsWith('10.') || currentHost.startsWith('172.');
    const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';

    console.log('🔍 Detectando configuração da API:', {
      currentHost,
      currentProtocol,
      isNgrok,
      isOciProduction,
      isLocalNetworkAccess,
      isLocalhost,
      fullUrl: window.location.href
    });

    // Ambientes locais ou via rede: usar proxy local /api para evitar CORS
    if (isLocalhost || isLocalNetworkAccess) {
      console.log('🏠 Ambiente local detectado (localhost ou IP de rede)');
      const port = window.location.port;

      // Se estiver rodando na porta do Vite (5000), usar /api (proxy do Vite)
      if (port === '5000') {
        console.log('✅ Usando proxy local /api (Vite Dev Server)');
        return '/api';
      }

      // Se estiver rodando sem porta (80/443) ou outra porta, assumir Nginx/Produção
      console.log('✅ Usando proxy direto /healthcore-api (Nginx/Produção)');
      return `${window.location.origin}/healthcore-api`;
    }

    // Acesso via ngrok: usar /api para evitar Mixed Content (HTTPS → HTTP)
    if (isNgrok) {
      console.log('🌐 Detectado acesso via ngrok');
      console.log('✅ Usando proxy local /api (evita Mixed Content)');
      return '/api';
    }

    // Produção na OCI: usar proxy relativo para mesma origem
    if (isOciProduction) {
      console.log('🚀 Detectado acesso via OCI (produção)');
      console.log('✅ Usando proxy relativo /healthcore-api para mesma origem');
      return '/healthcore-api'; // Manter relativo na OCI ou mudar para absolute também se quiser
    }

    // Fora da OCI: permitir configuração via variáveis de ambiente
    const envApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (envApiUrl) {
      console.log('✅ Usando URL da API do .env:', envApiUrl);
      return envApiUrl;
    }

    // Se for ngrok, usar proxy local para evitar Mixed Content
    if (isNgrok) {
      console.log('🌐 Detectado acesso via ngrok');
      console.log('🔧 Usando proxy local para evitar Mixed Content (HTTPS → HTTP)');
      return '/api';
    }

    // Se está sendo acessado via IP da rede local (não localhost)
    // Usar proxy local para evitar problemas de CORS
    if (isLocalNetworkAccess) {
      console.log('🏠 Detectado acesso via IP da rede local');
      console.log('✅ Usando proxy local para evitar problemas de CORS');
      return '/api';
    }

    // Se for localhost, usar proxy local (mais confiável)
    if (isLocalhost) {
      console.log('🏠 Detectado acesso via localhost');
      console.log('✅ Usando proxy local /api para conectividade com OCI');
      return '/api';
    }

    // Nenhuma variável definida – continuar detecção automática

    // Fallback para IP da máquina (preferencial)
    console.log('✅ Usando IP da máquina como fallback');
    return 'http://192.168.15.119:5000';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getTimeout(): number {
    return this.timeout;
  }

  public getFullUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  // Método para testar conectividade
  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health/ready`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao testar conexão com API:', error);
      return false;
    }
  }

  // Método para obter informações de debug
  public getDebugInfo() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      currentHost: window.location.hostname,
      isNgrok: window.location.hostname.includes('.ngrok'),
      environment: import.meta.env.MODE,
    };
  }
}

export const apiConfig = ApiConfig.getInstance();
