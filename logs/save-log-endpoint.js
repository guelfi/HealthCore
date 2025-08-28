const fs = require('fs');
const path = require('path');
const http = require('http');

class LogSaver {
  constructor() {
    this.logsDir = __dirname; // Current logs directory
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  generateFileName(type = 'frontend') {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${type}-debug-${date}.log`;
  }

  writeLog(logEntry) {
    try {
      const { level, component, message, data, timestamp } = logEntry;
      const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
      const logLine = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}${dataStr}\n`;
      
      const fileName = this.generateFileName('frontend');
      const filePath = path.join(this.logsDir, fileName);
      
      fs.appendFileSync(filePath, logLine, 'utf8');
      
      console.log(`✅ Log saved to: ${fileName}`);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Error saving log:', error);
      return { success: false, error: error.message };
    }
  }

  writeBulkLogs(logs) {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      const logContent = logs.map(log => {
        const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
        return `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.component}] ${log.message}${dataStr}`;
      }).join('\n');
      
      // Add header
      const header = `# AutoDebugger Frontend Logs\n# Generated: ${now.toISOString()}\n# Total Entries: ${logs.length}\n# =====================================\n\n`;
      const fullContent = header + logContent;
      
      const fileName = `frontend-debug-bulk-${dateStr}-${timeStr}.log`;
      const filePath = path.join(this.logsDir, fileName);
      
      fs.writeFileSync(filePath, fullContent, 'utf8');
      
      console.log(`✅ Bulk logs saved to: ${fileName}`);
      return { success: true, fileName, count: logs.length };
    } catch (error) {
      console.error('❌ Error saving bulk logs:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create HTTP server to receive logs from frontend
const logSaver = new LogSaver();
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save-log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const logData = JSON.parse(body);
        const result = logSaver.writeLog(logData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/save-bulk-logs') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { logs } = JSON.parse(body);
        const result = logSaver.writeBulkLogs(logs);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔧 AutoDebugger Log Server running on http://localhost:${PORT}`);
  console.log(`📁 Logs directory: ${logSaver.logsDir}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   POST /save-log - Save single log entry`);
  console.log(`   POST /save-bulk-logs - Save multiple log entries`);
});

// Export for direct use
module.exports = logSaver;