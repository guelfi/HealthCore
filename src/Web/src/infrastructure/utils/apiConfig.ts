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

    console.log('🔍 Detectando configuração da API:', {
      currentHost,
      currentProtocol,
      isNgrok,
      fullUrl: window.location.href
    });

    // Se for ngrok, precisamos usar a URL do ngrok da API
    if (isNgrok) {
      console.log('🌐 Detectado acesso via ngrok');
      
      // Verificar se há uma URL específica da API ngrok no .env
      const ngrokApiUrl = import.meta.env.VITE_NGROK_API_URL;
      if (ngrokApiUrl && ngrokApiUrl !== 'https://SUA_URL_NGROK_DA_API.ngrok-free.app') {
        console.log('✅ Usando URL ngrok da API do .env:', ngrokApiUrl);
        return ngrokApiUrl;
      }

      // Fallback especial para ngrok: mostrar mensagem de instrução
      console.warn('⚠️ Acesso via ngrok detectado, mas API ngrok não está configurada');
      console.warn('💡 Para usar via ngrok:');
      console.warn('   1. Execute: ngrok http 5000 (em outro terminal)');
      console.warn('   2. Configure VITE_NGROK_API_URL no .env.local');
      console.warn('   3. Ou use o IP da máquina: http://192.168.15.119:5005');
      
      // Tentar usar IP local como fallback (pode não funcionar via ngrok devido a Mixed Content)
      return 'http://192.168.15.119:5000';
    }

    // Se não for ngrok, usar configuração local
    const envApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (envApiUrl) {
      console.log('✅ Usando URL da API do .env:', envApiUrl);
      return envApiUrl;
    }

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
