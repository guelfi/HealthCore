export class ApiConfig {
  private static instance: ApiConfig;
  private readonly baseUrl: string;
  private readonly timeout: number;

  private constructor() {
    this.baseUrl = this.detectApiUrl();
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  private detectApiUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getTimeout(): number {
    return this.timeout;
  }
}

export const apiConfig = ApiConfig.getInstance();