/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_ENABLE_DEBUGGER: string;
  readonly VITE_ENABLE_CONSOLE_LOGS: string;
  readonly VITE_ENABLE_PERFORMANCE_MONITOR: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly VITE_ENABLE_DEBUG_ROUTING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
