const pm2 = require('pm2');

const ICONS = {
    online   : '🟢',
    stopping : '🟠',
    stopped  : '🔴',
    launching: '🚀',
    errored  : '❌',
    'one-launch-status': '⚪',
    healthy  : '✅', // Novo ícone para API saudável
    unhealthy: '🔴'  // Novo ícone para API não saudável
};

const COLORS = {
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

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para verificar a saúde da API
async function checkApiHealth() {
    try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            const data = await response.json();
            return data.status === 'Healthy' ? 'healthy' : 'unhealthy';
        }
        return 'unhealthy';
    } catch (error) {
        return 'unhealthy';
    }
}

// Definir larguras das colunas
const COL_WIDTH_APP_NAME = 22;
const COL_WIDTH_STATUS = 25;
const COL_WIDTH_CPU = 10; // Ajustado para 10
const COL_WIDTH_MEMORY = 12; // Ajustado para 12
const COL_WIDTH_UPTIME = 10; // Ajustado para 10
const COL_WIDTH_RESTARTS = 10; // Ajustado para 10

pm2.connect(async (err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.list(async (err, list) => {
        if (err) {
            console.error(err);
            pm2.disconnect();
            process.exit(2);
        }

        // Construir a linha superior da tabela
        const headerTop = `${COLORS.cyan}┌${'─'.repeat(COL_WIDTH_APP_NAME + 2)}┬${'─'.repeat(COL_WIDTH_STATUS + 2)}┬${'─'.repeat(COL_WIDTH_CPU + 2)}┬${'─'.repeat(COL_WIDTH_MEMORY + 2)}┬${'─'.repeat(COL_WIDTH_UPTIME + 2)}┬${'─'.repeat(COL_WIDTH_RESTARTS + 2)}┐${COLORS.reset}`;
        console.log(headerTop);

        // Construir a linha de cabeçalho
        const headerLine = `${COLORS.cyan}│ ${COLORS.bright}App name${' '.repeat(COL_WIDTH_APP_NAME - 'App name'.length)} ${COLORS.reset}${COLORS.cyan} │ ${COLORS.bright}Status${' '.repeat(COL_WIDTH_STATUS - 'Status'.length)} ${COLORS.reset}${COLORS.cyan} │ ${COLORS.bright}CPU${' '.repeat(COL_WIDTH_CPU - 'CPU'.length)} ${COLORS.reset}${COLORS.cyan} │ ${COLORS.bright}Memory${' '.repeat(COL_WIDTH_MEMORY - 'Memory'.length)} ${COLORS.reset}${COLORS.cyan} │ ${COLORS.bright}Uptime${' '.repeat(COL_WIDTH_UPTIME - 'Uptime'.length)} ${COLORS.reset}${COLORS.cyan} │ ${COLORS.bright}Restarts${' '.repeat(COL_WIDTH_RESTARTS - 'Restarts'.length)} ${COLORS.reset}${COLORS.cyan} │${COLORS.reset}`;
        console.log(headerLine);

        // Construir a linha do meio da tabela
        const headerMiddle = `${COLORS.cyan}├${'─'.repeat(COL_WIDTH_APP_NAME + 2)}┼${'─'.repeat(COL_WIDTH_STATUS + 2)}┼${'─'.repeat(COL_WIDTH_CPU + 2)}┼${'─'.repeat(COL_WIDTH_MEMORY + 2)}┼${'─'.repeat(COL_WIDTH_UPTIME + 2)}┼${'─'.repeat(COL_WIDTH_RESTARTS + 2)}┤${COLORS.reset}`;
        console.log(headerMiddle);

        const promises = list.map(async proc => {
            let displayStatus = proc.pm2_env.status;
            let icon = ICONS[displayStatus] || '⚪';

            if (proc.name === 'api') {
                const apiHealth = await checkApiHealth();
                displayStatus = `API ${apiHealth}`;
                icon = ICONS[apiHealth];
            }

            const statusFormatted = `${icon} ${displayStatus}`;
            const cpu = `${proc.monit.cpu}%`;
            const mem = formatBytes(proc.monit.memory);
            const uptime = proc.pm2_env.uptime ? new Date(Date.now() - proc.pm2_env.uptime).toISOString().substr(11, 8) : '0s';
            const restarts = proc.pm2_env.restart_time;

            return `${COLORS.cyan}│${COLORS.reset} ${proc.name.padEnd(COL_WIDTH_APP_NAME)} ${COLORS.cyan}│${COLORS.reset} ${statusFormatted.padEnd(COL_WIDTH_STATUS)} ${COLORS.cyan}│${COLORS.reset} ${cpu.padEnd(COL_WIDTH_CPU)} ${COLORS.cyan}│${COLORS.reset} ${mem.padEnd(COL_WIDTH_MEMORY)} ${COLORS.cyan}│${COLORS.reset} ${uptime.padEnd(COL_WIDTH_UPTIME)} ${COLORS.cyan}│${COLORS.reset} ${restarts.toString().padEnd(COL_WIDTH_RESTARTS)} ${COLORS.cyan}│${COLORS.reset}`;
        });

        const results = await Promise.all(promises);
        results.forEach(line => console.log(line));

        // Construir a linha inferior da tabela
        const footerLine = `${COLORS.cyan}└${'─'.repeat(COL_WIDTH_APP_NAME + 2)}┴${'─'.repeat(COL_WIDTH_STATUS + 2)}┴${'─'.repeat(COL_WIDTH_CPU + 2)}┴${'─'.repeat(COL_WIDTH_MEMORY + 2)}┴${'─'.repeat(COL_WIDTH_UPTIME + 2)}┴${'─'.repeat(COL_WIDTH_RESTARTS + 2)}┘${COLORS.reset}`;
        console.log(footerLine);
        pm2.disconnect();
    });
});
