/**
 * 🔄 Script para Atualizar Status de Tarefas
 * 
 * Execução: node scripts/update-task.js <etapa> <taskId> <status> [notes]
 * 
 * Exemplos:
 *   node scripts/update-task.js pacientes validate_backend_endpoints COMPLETE "Endpoints validados"
 *   node scripts/update-task.js exames create_exame_service IN_PROGRESS
 * 
 * Este script atualiza o status das tarefas sem precisar de privilégios administrativos.
 */

const fs = require('fs');
const path = require('path');

// Mapeamento das etapas
const ETAPAS_MAP = {
  'pacientes': {
    folder: 'IntegrationPacientes',
    file: 'integration_pacientes_001.json'
  },
  'exames': {
    folder: 'IntegrationExames',
    file: 'integration_exames_001.json'
  },
  'usuarios': {
    folder: 'IntegrationUsuarios',
    file: 'integration_usuarios_001.json'
  },
  'medicos': {
    folder: 'IntegrationMedicos',
    file: 'integration_medicos_complete_001.json'
  }
};

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETE', 'ERROR'];

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function showUsage() {
  colorLog('\n📋 USO DO SCRIPT:', 'blue');
  colorLog('node scripts/update-task.js <etapa> <taskId> <status> [notes]', 'cyan');
  
  colorLog('\n📂 ETAPAS DISPONÍVEIS:', 'blue');
  Object.keys(ETAPAS_MAP).forEach(etapa => {
    colorLog(`  • ${etapa}`, 'white');
  });
  
  colorLog('\n📊 STATUS VÁLIDOS:', 'blue');
  VALID_STATUSES.forEach(status => {
    colorLog(`  • ${status}`, 'white');
  });
  
  colorLog('\n💡 EXEMPLOS:', 'blue');
  colorLog('  node scripts/update-task.js pacientes validate_backend_endpoints COMPLETE "Endpoints validados"', 'gray');
  colorLog('  node scripts/update-task.js exames create_exame_service IN_PROGRESS', 'gray');
}

function updateTask(etapa, taskId, status, notes = '') {
  try {
    // Validar parâmetros
    if (!ETAPAS_MAP[etapa]) {
      colorLog(`❌ Etapa inválida: ${etapa}`, 'red');
      colorLog('Etapas disponíveis: ' + Object.keys(ETAPAS_MAP).join(', '), 'yellow');
      return false;
    }

    if (!VALID_STATUSES.includes(status)) {
      colorLog(`❌ Status inválido: ${status}`, 'red');
      colorLog('Status válidos: ' + VALID_STATUSES.join(', '), 'yellow');
      return false;
    }

    // Construir caminho do arquivo
    const etapaConfig = ETAPAS_MAP[etapa];
    const jsonPath = path.join('tasks', etapaConfig.folder, etapaConfig.file);

    // Verificar se arquivo existe
    if (!fs.existsSync(jsonPath)) {
      colorLog(`❌ Arquivo não encontrado: ${jsonPath}`, 'red');
      return false;
    }

    // Ler arquivo JSON
    const content = fs.readFileSync(jsonPath, 'utf8');
    const sessionData = JSON.parse(content);

    // Encontrar a tarefa
    const task = sessionData.tasks.find(t => t.id === taskId);
    if (!task) {
      colorLog(`❌ Tarefa não encontrada: ${taskId}`, 'red');
      colorLog('\nTarefas disponíveis:', 'yellow');
      sessionData.tasks.forEach(t => {
        colorLog(`  • ${t.id} - ${t.content}`, 'gray');
      });
      return false;
    }

    // Backup do estado anterior
    const previousStatus = task.status;
    const currentTime = new Date().toISOString();

    // Atualizar timestamps baseado no status
    switch (status) {
      case 'IN_PROGRESS':
        if (!task.started_at) {
          task.started_at = currentTime;
        }
        task.completed_at = null;
        break;
      case 'COMPLETE':
        if (!task.started_at) {
          task.started_at = currentTime;
        }
        task.completed_at = currentTime;
        break;
      case 'PENDING':
        task.started_at = null;
        task.completed_at = null;
        break;
      case 'ERROR':
        if (!task.started_at) {
          task.started_at = currentTime;
        }
        task.completed_at = null;
        break;
    }

    // Atualizar status e notas
    task.status = status;
    if (notes) {
      task.notes = notes;
    }

    // Recalcular resumo do progresso
    const totalTasks = sessionData.tasks.length;
    const completedTasks = sessionData.tasks.filter(t => t.status === 'COMPLETE').length;
    const inProgressTasks = sessionData.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const pendingTasks = sessionData.tasks.filter(t => t.status === 'PENDING').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    sessionData.progress_summary = {
      total_tasks: totalTasks,
      completed: completedTasks,
      in_progress: inProgressTasks,
      pending: pendingTasks,
      completion_percentage: completionPercentage
    };

    // Atualizar timestamp da sessão
    sessionData.session_info.last_updated = currentTime;

    // Salvar arquivo
    fs.writeFileSync(jsonPath, JSON.stringify(sessionData, null, 2), 'utf8');

    // Exibir resultado
    colorLog('\n🔄 TAREFA ATUALIZADA COM SUCESSO!', 'green');
    colorLog('='.repeat(50), 'green');
    
    colorLog(`\n📋 Etapa: ${etapa.toUpperCase()}`, 'cyan');
    colorLog(`ID: ${task.id}`, 'white');
    colorLog(`Descrição: ${task.content}`, 'white');
    colorLog(`Status: ${previousStatus} → ${status}`, 'yellow');
    
    if (notes) {
      colorLog(`Notas: ${notes}`, 'white');
    }

    colorLog(`\n📊 Progresso da Etapa: ${completionPercentage}% (${completedTasks}/${totalTasks})`, 'cyan');

    // Barra de progresso
    const barLength = 30;
    const completedBars = Math.floor(completionPercentage * barLength / 100);
    const remainingBars = barLength - completedBars;
    const progressBar = '█'.repeat(completedBars) + '░'.repeat(remainingBars);
    colorLog(`[${progressBar}] ${completionPercentage}%`, 'cyan');

    // Próxima tarefa sugerida
    const nextTask = sessionData.tasks.find(t => t.status === 'PENDING');
    if (nextTask) {
      colorLog(`\n🎯 Próxima Tarefa: ${nextTask.id}`, 'yellow');
      colorLog(`${nextTask.content}`, 'white');
    }

    // Verificar se etapa está completa
    if (completionPercentage === 100) {
      colorLog(`\n🎉 PARABÉNS! ETAPA ${etapa.toUpperCase()} 100% CONCLUÍDA!`, 'green');
    }

    return true;

  } catch (error) {
    colorLog(`❌ Erro ao atualizar tarefa: ${error.message}`, 'red');
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    showUsage();
    process.exit(1);
  }

  const [etapa, taskId, status, notes] = args;
  
  if (updateTask(etapa, taskId, status, notes)) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

module.exports = { updateTask };