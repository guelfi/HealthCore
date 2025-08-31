import React from 'react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
}

class AutoDebuggerLogger {
  private static instance: AutoDebuggerLogger;
  private logs: LogEntry[] = [];
  private listeners: Set<() => void> = new Set();
  private logElement: HTMLElement | null = null;
  private downloadButton: HTMLElement | null = null;
  private isVisible = false; // Inicia oculto por padrão
  private maxLogs = 15;
  // private isWriting = false; // Removed unused variable
  private keyboardListenerAttached = false;
  private isEnabled = false; // Inicia desabilitado por padrão
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null;

  static getInstance(): AutoDebuggerLogger {
    if (!AutoDebuggerLogger.instance) {
      AutoDebuggerLogger.instance = new AutoDebuggerLogger();
      // Ensure keyboard listener is set up immediately when instance is created
      AutoDebuggerLogger.instance.setupKeyboardListener();
    }
    return AutoDebuggerLogger.instance;
  }

  private setupKeyboardListener() {
    if (this.keyboardListenerAttached) return;

    this.keyboardHandler = (event: KeyboardEvent) => {
      // Ctrl + Alt + D para toggle do AutoDebugger
      // Verificação mais robusta
      if (
        event.ctrlKey &&
        event.altKey &&
        (event.key === 'D' || event.key === 'd' || event.code === 'KeyD')
      ) {
        event.preventDefault();
        this.toggleDebugger();
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
    this.keyboardListenerAttached = true;

    // Adicionar listener para foco da página
    const handleFocus = () => {
      console.log('🎹 AutoDebugger: Página ganhou foco');
    };

    window.addEventListener('focus', handleFocus);

    // Log de sucesso
    console.log('🎹 AutoDebugger: Listener de teclado adicionado com sucesso');

    // Log informativo sobre o atalho
    setTimeout(() => {
      this.log(
        'info',
        'AutoDebugger',
        '🎹 Atalho ativado: Ctrl + Alt + D para mostrar/esconder'
      );
    }, 1000);
  }

  private toggleDebugger() {
    this.isEnabled = !this.isEnabled;

    if (this.isEnabled) {
      // Mostrar painel se estiver habilitado
      if (!this.logElement) {
        this.createUI();
      } else {
        this.showUI();
      }
      this.log(
        'success',
        'AutoDebugger',
        '🔍 AutoDebugger ATIVADO via teclado (Ctrl+Alt+D)'
      );
      this.showToastNotification('🔍 AutoDebugger ATIVADO', '#4CAF50');
    } else {
      // Esconder painel
      this.hideUI();
      this.log(
        'warning',
        'AutoDebugger',
        '🙈 AutoDebugger DESATIVADO via teclado (Ctrl+Alt+D)'
      );
      this.showToastNotification('🙈 AutoDebugger DESATIVADO', '#ff9800');
    }
  }

  private showToastNotification(message: string, color: string) {
    // Criar toast notification temporário
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${color};
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-weight: bold;
      font-size: 14px;
      z-index: 1001;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      pointer-events: none;
    `;

    toast.textContent = message;

    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes slideOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Remover após 2 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 300);
    }, 2000);
  }

  private showUI() {
    if (this.logElement) {
      this.logElement.style.display = 'block';
    }
    if (this.downloadButton) {
      this.downloadButton.style.display = 'block';
    }
    this.isVisible = true;
  }

  private hideUI() {
    if (this.logElement) {
      this.logElement.style.display = 'none';
    }
    if (this.downloadButton) {
      this.downloadButton.style.display = 'none';
    }
    this.isVisible = false;
  }

  log(
    level: 'info' | 'success' | 'warning' | 'error' | 'debug',
    component: string,
    message: string,
    data?: any
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(logEntry);

    // Manter apenas os últimos logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Também enviar para console
    const consoleMessage = `[${component}] ${message}`;
    switch (level) {
      case 'error':
        console.error(consoleMessage, data);
        break;
      case 'warning':
        console.warn(consoleMessage, data);
        break;
      case 'success':
        console.log(`✅ ${consoleMessage}`, data);
        break;
      case 'debug':
        console.debug(consoleMessage, data);
        break;
      default:
        console.log(consoleMessage, data);
    }

    // Salvar no localStorage
    this.saveToStorage();

    // Enviar para arquivo de log (se possível)
    this.saveToFile();

    // Atualizar UI apenas se estiver habilitado
    if (this.isEnabled) {
      this.updateDisplay();
    }

    // Notificar listeners
    this.notifyListeners();
  }

  private saveToStorage() {
    try {
      localStorage.setItem('auto-debugger-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Erro ao salvar logs no localStorage:', error);
    }
  }

  private async saveToFile() {
    // Disabled log server connection to avoid network errors
    // Just save to localStorage for now
    return;
  }

  // Removed unused functions: saveToProjectLogs, fallbackToNodeSave

  // Removed unused functions: scheduleFileSave, saveAllLogsToProjectFolder, downloadLogsToProjectFolder

  private loadFromStorage() {
    try {
      const savedLogs = localStorage.getItem('auto-debugger-logs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs do localStorage:', error);
    }
  }

  private getLogIcon(level: string): string {
    switch (level) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'debug':
        return '🔍';
      default:
        return 'ℹ️';
    }
  }

  private getLogColor(level: string): string {
    switch (level) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'debug':
        return '#9c27b0';
      default:
        return '#2196f3';
    }
  }

  private updateDisplay() {
    if (!this.isVisible || !this.logElement) return;

    // Mostrar apenas os últimos logs
    const recentLogs = this.logs.slice(-this.maxLogs);

    this.logElement.innerHTML = '';

    recentLogs.forEach((log, _index) => {
      const logDiv = document.createElement('div');
      logDiv.style.cssText = `
        margin-bottom: 4px;
        padding: 4px 6px;
        border-radius: 3px;
        font-size: 10px;
        line-height: 1.2;
        border-left: 3px solid ${this.getLogColor(log.level)};
        background: rgba(255,255,255,0.05);
        word-break: break-word;
      `;

      const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');
      const shortData = log.data
        ? ` | ${JSON.stringify(log.data).substring(0, 50)}...`
        : '';

      logDiv.innerHTML = `
        <div style=\"color: ${this.getLogColor(log.level)}; font-weight: bold;\">
          ${this.getLogIcon(log.level)} [${log.component}] ${time}
        </div>
        <div style=\"color: white; margin-top: 2px;\">
          ${log.message}${shortData}
        </div>
      `;

      this.logElement?.appendChild(logDiv);
    });

    // Scroll para o final
    if (this.logElement) {
      this.logElement.scrollTop = this.logElement.scrollHeight;
    }
  }

  createUI() {
    if (this.logElement) return; // Já criado

    // Criar painel de logs
    this.logElement = document.createElement('div');
    this.logElement.id = 'auto-debugger-panel';
    this.logElement.style.cssText = `
      position: fixed;
      top: 70px;
      right: 10px;
      width: 380px;
      max-height: 400px;
      background: rgba(0,0,0,0.9);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      padding: 10px;
      border-radius: 8px;
      z-index: 999;
      overflow-y: auto;
      border: 2px solid #4CAF50;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
    `;

    // Título do painel
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #333;
      font-weight: bold;
      color: #4CAF50;
    `;
    header.innerHTML = `
      <span>🔧 AutoDebugger <small style="color: #888; font-size: 8px;">(Ctrl+Alt+D)</small></span>
      <div>
        <button id="save-debugger" style="background: none; border: 1px solid #4CAF50; color: #4CAF50; padding: 2px 6px; border-radius: 3px; cursor: pointer; margin-right: 4px; font-size: 9px;">💾 Save</button>
        <button id="toggle-debugger" style="background: none; border: 1px solid #666; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer; margin-right: 4px; font-size: 9px;">👁️ Hide</button>
        <button id="clear-debugger" style="background: none; border: 1px solid #666; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 9px;">🗑️ Clear</button>
      </div>
    `;

    this.logElement.appendChild(header);
    document.body.appendChild(this.logElement);

    // Iniciar oculto
    this.logElement.style.display = 'none';

    // Criar botão de download
    this.downloadButton = document.createElement('button');
    this.downloadButton.textContent = '📥 Download Logs';
    this.downloadButton.style.cssText = `
      position: fixed;
      top: 480px;
      right: 10px;
      padding: 8px 12px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1000;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    this.downloadButton.onclick = () => this.downloadLogs();
    document.body.appendChild(this.downloadButton);

    // Iniciar oculto
    this.downloadButton.style.display = 'none';

    // Event listeners
    const saveButton = document.getElementById('save-debugger');
    const toggleButton = document.getElementById('toggle-debugger');
    const clearButton = document.getElementById('clear-debugger');

    saveButton?.addEventListener('click', () => this.downloadLogs());
    toggleButton?.addEventListener('click', () => this.toggle());
    clearButton?.addEventListener('click', () => this.clear());

    // Carregar logs salvos
    this.loadFromStorage();
    // Não mostrar display inicialmente (só quando ativado)

    // Log inicial apenas no console
    console.log('🔧 AutoDebugger carregado - Use Ctrl+Alt+D para ativar');
  }

  toggle() {
    this.isVisible = !this.isVisible;
    if (this.logElement) {
      this.logElement.style.display = this.isVisible ? 'block' : 'none';
    }
    if (this.downloadButton) {
      this.downloadButton.style.display = this.isVisible ? 'block' : 'none';
    }

    const toggleButton = document.getElementById('toggle-debugger');
    if (toggleButton) {
      toggleButton.textContent = this.isVisible ? '👁️ Hide' : '👁️ Show';
    }
  }

  clear() {
    this.logs = [];
    localStorage.removeItem('auto-debugger-logs');
    this.updateDisplay();
    this.log('info', 'AutoDebugger', 'Logs limpos!');
  }

  downloadLogs() {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

      const logContent = this.logs
        .map(log => {
          const dataStr = log.data
            ? `\nData: ${JSON.stringify(log.data, null, 2)}`
            : '';
          return `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.component}] ${log.message}${dataStr}`;
        })
        .join('\n\n');

      // Adicionar cabeçalho informativo
      const header = `# AutoDebugger Log File\n# Generated: ${now.toISOString()}\n# Total Entries: ${this.logs.length}\n# =====================================\n\n`;
      const fullContent = header + logContent;

      const blob = new Blob([fullContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `auto-debug-${dateStr}-${timeStr}.log`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      this.log(
        'success',
        'AutoDebugger',
        `Logs baixados: auto-debug-${dateStr}-${timeStr}.log`
      );
    } catch (error) {
      this.log('error', 'AutoDebugger', 'Erro ao baixar logs:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  addListener(callback: () => void) {
    this.listeners.add(callback);
  }

  removeListener(callback: () => void) {
    this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  destroy() {
    if (this.logElement) {
      document.body.removeChild(this.logElement);
      this.logElement = null;
    }
    if (this.downloadButton) {
      document.body.removeChild(this.downloadButton);
      this.downloadButton = null;
    }

    // Remover listener de teclado
    if (this.keyboardListenerAttached && this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
      this.keyboardListenerAttached = false;
    }

    this.listeners.clear();
  }
}

// Hook React para usar o AutoDebugger
export const useAutoDebugger = (componentName: string) => {
  const debugLogger = React.useMemo(() => AutoDebuggerLogger.getInstance(), []);

  const log = React.useCallback(
    (
      level: 'info' | 'success' | 'warning' | 'error' | 'debug',
      message: string,
      data?: any
    ) => {
      debugLogger.log(level, componentName, message, data);
    },
    [debugLogger, componentName]
  );

  return {
    log,
    info: (message: string, data?: any) => log('info', message, data),
    success: (message: string, data?: any) => log('success', message, data),
    warning: (message: string, data?: any) => log('warning', message, data),
    error: (message: string, data?: any) => log('error', message, data),
    debug: (message: string, data?: any) => log('debug', message, data),
  };
};

// Componente AutoDebugger
interface AutoDebuggerProps {
  children: React.ReactNode;
  componentName?: string;
  enabled?: boolean;
}

export const AutoDebugger: React.FC<AutoDebuggerProps> = ({
  children,
  componentName = 'AutoDebugger',
  enabled = true,
}) => {
  const debugLogger = useAutoDebugger(componentName);

  React.useEffect(() => {
    if (enabled) {
      debugLogger.info('Componente AutoDebugger montado');
    }
  }, [enabled, debugLogger]);

  if (!enabled) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default AutoDebugger;
