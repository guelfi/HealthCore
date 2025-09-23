/**
 * Utilitário para gerenciar configurações de debug e desenvolvimento
 */

interface DebugConfig {
  isEnabled: boolean;
  showConsole: boolean;
  showPerformance: boolean;
  environment: string;
  version: string;
}

class DebugManager {
  private static instance: DebugManager;
  private config: DebugConfig;

  private constructor() {
    this.config = {
      isEnabled: this.parseBoolean(import.meta.env.VITE_ENABLE_DEBUGGER),
      showConsole: this.parseBoolean(import.meta.env.VITE_ENABLE_CONSOLE_LOGS),
      showPerformance: this.parseBoolean(import.meta.env.VITE_ENABLE_PERFORMANCE_MONITOR),
      environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };
  }

  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  private parseBoolean(value: string | undefined): boolean {
    return value === 'true';
  }

  get isDebugEnabled(): boolean {
    return import.meta.env.DEV && this.config.isEnabled;
  }

  get isConsoleEnabled(): boolean {
    return this.config.showConsole;
  }

  get isPerformanceEnabled(): boolean {
    return this.config.showPerformance;
  }

  get environment(): string {
    return this.config.environment;
  }

  get version(): string {
    return this.config.version;
  }

  get isProduction(): boolean {
    return this.config.environment === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  /**
   * Log apenas se o console estiver habilitado
   */
  log(message: string, ...args: any[]): void {
    if (this.isConsoleEnabled && !this.isProduction) {
      console.log(`🐛 [HealthCore Debug] ${message}`, ...args);
    }
  }

  /**
   * Log de erro sempre habilitado
   */
  error(message: string, ...args: any[]): void {
    console.error(`❌ [HealthCore Error] ${message}`, ...args);
  }

  /**
   * Log de aviso sempre habilitado
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`⚠️ [HealthCore Warning] ${message}`, ...args);
  }

  /**
   * Log de informação apenas em desenvolvimento
   */
  info(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.info(`ℹ️ [HealthCore Info] ${message}`, ...args);
    }
  }

  /**
   * Obtém todas as configurações de debug
   */
  getConfig(): DebugConfig & { isDev: boolean; isProd: boolean } {
    return {
      ...this.config,
      isDev: this.isDevelopment,
      isProd: this.isProduction,
    };
  }

  /**
   * Exibe informações do sistema no console
   */
  logSystemInfo(): void {
    if (!this.isDebugEnabled) return;

    console.group('🏥 HealthCore - System Information');
    console.log('📱 Environment:', this.environment);
    console.log('🔧 Version:', this.version);
    console.log('🐛 Debug Enabled:', this.isDebugEnabled);
    console.log('📝 Console Logs:', this.isConsoleEnabled);
    console.log('⚡ Performance Monitor:', this.isPerformanceEnabled);
    console.log('🌍 User Agent:', navigator.userAgent);
    console.log('🖥️ Platform:', navigator.platform);
    console.log('🗣️ Language:', navigator.language);
    console.log('📊 Screen:', `${screen.width}x${screen.height}`);
    console.log('🔍 Viewport:', `${window.innerWidth}x${window.innerHeight}`);
    console.groupEnd();
  }
}

// Instância singleton
export const debugManager = DebugManager.getInstance();

// Hook para usar as configurações de debug
export const useDebugConfig = () => {
  return debugManager.getConfig();
};

// Funções de conveniência
export const isDebugEnabled = () => debugManager.isDebugEnabled;
export const logDebug = (message: string, ...args: any[]) => debugManager.log(message, ...args);
export const logError = (message: string, ...args: any[]) => debugManager.error(message, ...args);
export const logWarn = (message: string, ...args: any[]) => debugManager.warn(message, ...args);
export const logInfo = (message: string, ...args: any[]) => debugManager.info(message, ...args);

// Inicializa as informações do sistema no carregamento (apenas em desenvolvimento)
if (debugManager.isDebugEnabled) {
  debugManager.logSystemInfo();
}