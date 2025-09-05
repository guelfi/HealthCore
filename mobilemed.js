#!/usr/bin/env node

/**
 * 🏥 MobileMed - Gerenciador de Serviços
 * Script unificado para gerenciar API e Frontend
 * Compatível com Windows, macOS e Linux
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Configurações
const config = {
    api: {
        port: 5000,
        path: path.join(__dirname, 'src', 'Api'),
        command: 'dotnet',
        args: ['run'],
        healthEndpoint: '/health'
    },
    frontend: {
        port: 5005,
        path: path.join(__dirname, 'src', 'Web'),
        command: 'npm',
        args: ['run', 'dev'],
        healthEndpoint: '/'
    }
};

// Utilitários
class Logger {
    static info(message) {
        console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
    }
    
    static success(message) {
        console.log(`${colors.green}✅${colors.reset} ${message}`);
    }
    
    static error(message) {
        console.log(`${colors.red}❌${colors.reset} ${message}`);
    }
    
    static warning(message) {
        console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
    }
    
    static header(message) {
        console.log(`\n${colors.cyan}${colors.bright}🏥 ${message}${colors.reset}`);
        console.log('='.repeat(50));
    }
}

class ServiceManager {
    constructor() {
        this.processes = new Map();
        this.pidFile = path.join(__dirname, '.mobilemed.pids');
        this.loadPids();
    }
    
    loadPids() {
        try {
            if (fs.existsSync(this.pidFile)) {
                const data = fs.readFileSync(this.pidFile, 'utf8');
                const pids = JSON.parse(data);
                this.processes = new Map(Object.entries(pids));
            }
        } catch (error) {
            Logger.warning('Não foi possível carregar PIDs salvos');
        }
    }
    
    savePids() {
        try {
            const pids = Object.fromEntries(this.processes);
            fs.writeFileSync(this.pidFile, JSON.stringify(pids, null, 2));
        } catch (error) {
            Logger.error('Erro ao salvar PIDs');
        }
    }
    
    getLocalIP() {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return '127.0.0.1';
    }
    
    async checkPort(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            
            server.listen(port, () => {
                server.once('close', () => resolve(false));
                server.close();
            });
            
            server.on('error', () => resolve(true));
        });
    }
    
    async startService(serviceName) {
        const serviceConfig = config[serviceName];
        if (!serviceConfig) {
            Logger.error(`Serviço '${serviceName}' não encontrado`);
            return false;
        }
        
        // Verificar se já está rodando
        const isRunning = await this.checkPort(serviceConfig.port);
        if (isRunning) {
            Logger.warning(`${serviceName.toUpperCase()} já está rodando na porta ${serviceConfig.port}`);
            return true;
        }
        
        Logger.info(`Iniciando ${serviceName.toUpperCase()}...`);
        
        const process = spawn(serviceConfig.command, serviceConfig.args, {
            cwd: serviceConfig.path,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: true
        });
        
        process.unref();
        this.processes.set(serviceName, process.pid);
        this.savePids();
        
        // Aguardar inicialização
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const stillRunning = await this.checkPort(serviceConfig.port);
        if (stillRunning) {
            const localIP = this.getLocalIP();
            Logger.success(`${serviceName.toUpperCase()} iniciado com sucesso!`);
            Logger.info(`🌐 Local: http://localhost:${serviceConfig.port}`);
            Logger.info(`🌐 Rede: http://${localIP}:${serviceConfig.port}`);
            return true;
        } else {
            Logger.error(`Falha ao iniciar ${serviceName.toUpperCase()}`);
            this.processes.delete(serviceName);
            this.savePids();
            return false;
        }
    }
    
    async stopService(serviceName) {
        const pid = this.processes.get(serviceName);
        if (!pid) {
            Logger.warning(`${serviceName.toUpperCase()} não está rodando`);
            return true;
        }
        
        try {
            process.kill(pid, 'SIGTERM');
            Logger.success(`${serviceName.toUpperCase()} parado com sucesso`);
            this.processes.delete(serviceName);
            this.savePids();
            return true;
        } catch (error) {
            Logger.error(`Erro ao parar ${serviceName.toUpperCase()}: ${error.message}`);
            return false;
        }
    }
    
    async getStatus(serviceName) {
        const serviceConfig = config[serviceName];
        const isRunning = await this.checkPort(serviceConfig.port);
        const pid = this.processes.get(serviceName);
        
        return {
            name: serviceName.toUpperCase(),
            running: isRunning,
            port: serviceConfig.port,
            pid: pid || 'N/A'
        };
    }
    
    async showStatus() {
        Logger.header('Status dos Serviços');
        
        for (const serviceName of Object.keys(config)) {
            const status = await this.getStatus(serviceName);
            const statusIcon = status.running ? '🟢' : '🔴';
            const statusText = status.running ? 'RODANDO' : 'PARADO';
            
            console.log(`${statusIcon} ${status.name}: ${statusText} (Porta: ${status.port}, PID: ${status.pid})`);
        }
        
        const localIP = this.getLocalIP();
        console.log(`\n🌐 IP Local: ${localIP}`);
    }
}

// Comandos principais
class MobileMed {
    constructor() {
        this.serviceManager = new ServiceManager();
    }
    
    async start(services = ['api', 'frontend']) {
        Logger.header('Iniciando MobileMed');
        
        for (const service of services) {
            await this.serviceManager.startService(service);
        }
        
        console.log('\n🎉 MobileMed iniciado! Use "node mobilemed.js status" para verificar o status.');
    }
    
    async stop(services = ['api', 'frontend']) {
        Logger.header('Parando MobileMed');
        
        for (const service of services) {
            await this.serviceManager.stopService(service);
        }
        
        console.log('\n✅ Serviços parados com sucesso!');
    }
    
    async restart(services = ['api', 'frontend']) {
        Logger.header('Reiniciando MobileMed');
        
        for (const service of services) {
            await this.serviceManager.stopService(service);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await this.serviceManager.startService(service);
        }
    }
    
    async status() {
        await this.serviceManager.showStatus();
    }
    
    showHelp() {
        console.log(`
${colors.cyan}${colors.bright}🏥 MobileMed - Gerenciador de Serviços${colors.reset}`);
        console.log('\nComandos disponíveis:');
        console.log('  node mobilemed.js start [api|frontend]  - Inicia os serviços');
        console.log('  node mobilemed.js stop [api|frontend]   - Para os serviços');
        console.log('  node mobilemed.js restart [api|frontend] - Reinicia os serviços');
        console.log('  node mobilemed.js status                 - Mostra status dos serviços');

        console.log('  node mobilemed.js help                   - Mostra esta ajuda');
        console.log('\nExemplos:');
        console.log('  node mobilemed.js start                  - Inicia API e Frontend');
        console.log('  node mobilemed.js start api              - Inicia apenas a API');
        console.log('  node mobilemed.js stop frontend          - Para apenas o Frontend');
    }

}

// Execução principal
if (require.main === module) {
    const mobilemed = new MobileMed();
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const services = args.slice(1).filter(arg => ['api', 'frontend'].includes(arg));
    
    switch (command) {
        case 'start':
            mobilemed.start(services.length > 0 ? services : undefined);
            break;
        case 'stop':
            mobilemed.stop(services.length > 0 ? services : undefined);
            break;
        case 'restart':
            mobilemed.restart(services.length > 0 ? services : undefined);
            break;
        case 'status':
            mobilemed.status();
            break;
        case 'help':
        default:
            mobilemed.showHelp();
            break;
    }
}

module.exports = MobileMed;