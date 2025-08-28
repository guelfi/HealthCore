/**
 * 📊 Script para Verificar Status da Integração
 * 
 * Execução: node scripts/check-integration-status.js
 * 
 * Este script lê os arquivos JSON de controle e exibe
 * o status atual de todas as etapas de integração
 * sem precisar de privilégios administrativos.
 */

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function colorLog(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Configuração das etapas
const ETAPAS = [
  {
    name: 'Pacientes',
    folder: 'IntegrationPacientes',
    file: 'integration_pacientes_001.json',
    priority: 'ALTA',
    complexity: 'Baixa'
  },
  {
    name: 'Exames',
    folder: 'IntegrationExames', 
    file: 'integration_exames_001.json',
    priority: 'ALTA',
    complexity: 'Média'
  },
  {
    name: 'Usuários',
    folder: 'IntegrationUsuarios',
    file: 'integration_usuarios_001.json',
    priority: 'MÉDIA',
    complexity: 'Média'
  },
  {
    name: 'Médicos',
    folder: 'IntegrationMedicos',
    file: 'integration_medicos_complete_001.json',
    priority: 'ALTA',
    complexity: 'Alta'
  }
];

function getStatusIcon(status) {
  switch (status) {
    case 'COMPLETE': return '✅';
    case 'IN_PROGRESS': return '🔄';
    case 'PENDING': return '⏳';
    case 'ERROR': return '❌';
    default: return '📋';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'COMPLETE': return 'green';
    case 'IN_PROGRESS': return 'yellow';
    case 'PENDING': return 'gray';
    case 'ERROR': return 'red';
    default: return 'reset';
  }
}

function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    colorLog(`❌ Erro ao ler ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

function createProgressBar(percentage, length = 30) {
  const completed = Math.floor((percentage / 100) * length);
  const remaining = length - completed;
  return '█'.repeat(completed) + '░'.repeat(remaining);
}

function checkIntegrationStatus() {
  console.log('\n🚀 STATUS DAS INTEGRAÇÕES - PROJETO MOBILEMED');
  colorLog('='.repeat(60), 'cyan');

  let totalEtapas = 0;
  let etapasConcluidas = 0;
  let totalTarefas = 0;
  let tarefasConcluidas = 0;

  colorLog('\n📋 RESUMO DAS ETAPAS:', 'blue');

  ETAPAS.forEach((etapa, index) => {
    const jsonPath = path.join('tasks', etapa.folder, etapa.file);
    const data = readJsonFile(jsonPath);
    
    totalEtapas++;
    
    if (data) {
      const progress = data.progress_summary;
      const percentage = progress.completion_percentage || 0;
      const isComplete = percentage === 100;
      
      if (isComplete) etapasConcluidas++;
      
      totalTarefas += progress.total_tasks || 0;
      tarefasConcluidas += progress.completed || 0;

      // Header da etapa
      colorLog(`\n${index + 1}. ${etapa.name.toUpperCase()}`, 'cyan');
      colorLog(`   Complexidade: ${etapa.complexity} | Prioridade: ${etapa.priority}`, 'gray');
      
      // Progresso
      const progressBar = createProgressBar(percentage);
      const statusColor = percentage === 100 ? 'green' : percentage > 0 ? 'yellow' : 'gray';
      colorLog(`   Progresso: [${progressBar}] ${percentage}%`, statusColor);
      colorLog(`   Tarefas: ${progress.completed}/${progress.total_tasks} concluídas`, 'white');
      
      // Status das tarefas por categoria
      if (data.tasks) {
        const tasksByStatus = data.tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});

        const statusSummary = Object.entries(tasksByStatus)
          .map(([status, count]) => `${getStatusIcon(status)} ${count}`)
          .join(' | ');
        
        colorLog(`   Status: ${statusSummary}`, 'white');
      }

      // Próxima prioridade
      if (data.next_session_priorities && data.next_session_priorities.length > 0) {
        colorLog(`   Próximo: ${data.next_session_priorities[0]}`, 'yellow');
      }

    } else {
      colorLog(`\n${index + 1}. ${etapa.name.toUpperCase()}`, 'cyan');
      colorLog('   ❌ Arquivo de controle não encontrado', 'red');
    }
  });

  // Resumo geral
  colorLog('\n📊 RESUMO GERAL DO PROJETO:', 'blue');
  const overallProgress = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;
  const overallProgressBar = createProgressBar(overallProgress);
  
  colorLog(`Etapas: [${overallProgressBar}] ${overallProgress}%`, overallProgress === 100 ? 'green' : 'yellow');
  colorLog(`${etapasConcluidas}/${totalEtapas} etapas concluídas`, 'white');
  colorLog(`${tarefasConcluidas}/${totalTarefas} tarefas concluídas no total`, 'white');

  // Status atual
  if (overallProgress === 100) {
    colorLog('\n🎉 PARABÉNS! TODAS AS ETAPAS CONCLUÍDAS!', 'green');
    colorLog('🚀 Projeto pronto para produção!', 'green');
  } else if (etapasConcluidas > 0) {
    colorLog(`\n🔄 Progresso em andamento - ${etapasConcluidas} etapa(s) concluída(s)`, 'yellow');
  } else {
    colorLog('\n⏳ Pronto para começar a primeira etapa (Pacientes)', 'cyan');
  }

  // Comandos úteis
  colorLog('\n🛠️  COMANDOS ÚTEIS:', 'blue');
  colorLog('Popular banco com dados de teste:', 'white');
  colorLog('  node scripts/populate-database.js', 'gray');
  colorLog('\nVerificar status novamente:', 'white');
  colorLog('  node scripts/check-integration-status.js', 'gray');
  colorLog('\nIniciar frontend:', 'white');
  colorLog('  npm run dev', 'gray');

  colorLog('\n' + '='.repeat(60), 'cyan');
}

// Executar se chamado diretamente
if (require.main === module) {
  checkIntegrationStatus();
}

module.exports = { checkIntegrationStatus };