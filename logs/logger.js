const fs = require('fs');
const path = require('path');

class FileLoggerNode {
  constructor() {
    this.logsDir = path.join(__dirname);
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  generateFileName(type = 'debug') {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${type}-${date}.log`;
  }

  writeLog(level, component, message, data = null) {
    try {
      const timestamp = new Date().toISOString();
      const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
      const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}${dataStr}\n`;
      
      const fileName = this.generateFileName('debug');
      const filePath = path.join(this.logsDir, fileName);
      
      fs.appendFileSync(filePath, logEntry, 'utf8');
    } catch (error) {
      console.error('Erro ao escrever log em arquivo:', error);
    }
  }

  writeErrorLog(component, error, context = null) {
    try {
      const timestamp = new Date().toISOString();
      const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
      const errorStr = error instanceof Error ? 
        `${error.message}\nStack: ${error.stack}` : 
        JSON.stringify(error);
      
      const logEntry = `[${timestamp}] [ERROR] [${component}] ${errorStr}${contextStr}\n`;
      
      const fileName = this.generateFileName('error');
      const filePath = path.join(this.logsDir, fileName);
      
      fs.appendFileSync(filePath, logEntry, 'utf8');
    } catch (writeError) {
      console.error('Erro ao escrever log de erro:', writeError);
    }
  }

  writeApiLog(method, url, status, responseTime, data = null) {
    try {
      const timestamp = new Date().toISOString();
      const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
      const logEntry = `[${timestamp}] [API] ${method} ${url} - ${status} (${responseTime}ms)${dataStr}\n`;
      
      const fileName = this.generateFileName('api');
      const filePath = path.join(this.logsDir, fileName);
      
      fs.appendFileSync(filePath, logEntry, 'utf8');
    } catch (error) {
      console.error('Erro ao escrever log de API:', error);
    }
  }

  getLogFiles() {
    try {
      return fs.readdirSync(this.logsDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logsDir, file),
          size: fs.statSync(path.join(this.logsDir, file)).size,
          modified: fs.statSync(path.join(this.logsDir, file)).mtime
        }));
    } catch (error) {
      console.error('Erro ao listar arquivos de log:', error);
      return [];
    }
  }

  readLogFile(fileName) {
    try {
      const filePath = path.join(this.logsDir, fileName);
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Erro ao ler arquivo de log:', error);
      return null;
    }
  }

  clearOldLogs(daysToKeep = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const files = fs.readdirSync(this.logsDir);
      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate && file.endsWith('.log')) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      console.log(`Limpeza de logs: ${deletedCount} arquivos antigos removidos.`);
      return deletedCount;
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      return 0;
    }
  }
}

module.exports = new FileLoggerNode();