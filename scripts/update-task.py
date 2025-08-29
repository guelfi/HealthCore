#!/usr/bin/env python3
"""
🔄 Script para Atualizar Status de Tarefas

Execução: python scripts/update-task.py <etapa> <taskId> <status> [notes]

Exemplos:
  python scripts/update-task.py pacientes validate_backend_endpoints COMPLETE "Endpoints validados"
  python scripts/update-task.py exames create_exame_service IN_PROGRESS

Este script atualiza o status das tarefas sem precisar de privilégios administrativos.
"""

import json
import os
import sys
from datetime import datetime

# Mapeamento das etapas
ETAPAS_MAP = {
    'pacientes': {
        'folder': 'IntegrationPacientes',
        'file': 'integration_pacientes_001.json'
    },
    'exames': {
        'folder': 'IntegrationExames',
        'file': 'integration_exames_001.json'
    },
    'usuarios': {
        'folder': 'IntegrationUsuarios',
        'file': 'integration_usuarios_001.json'
    },
    'medicos': {
        'folder': 'IntegrationMedicos',
        'file': 'integration_medicos_complete_001.json'
    }
}

VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETE', 'ERROR']

# Cores para console
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    MAGENTA = '\033[35m'
    GRAY = '\033[90m'

def color_log(message, color=Colors.RESET):
    """Imprime mensagem colorida no console"""
    print(f"{color}{message}{Colors.RESET}")

def show_usage():
    """Mostra instruções de uso do script"""
    color_log('\n📋 USO DO SCRIPT:', Colors.BLUE)
    color_log('python scripts/update-task.py <etapa> <taskId> <status> [notes]', Colors.CYAN)
    
    color_log('\n📂 ETAPAS DISPONÍVEIS:', Colors.BLUE)
    for etapa in ETAPAS_MAP.keys():
        color_log(f'  • {etapa}', Colors.WHITE)
    
    color_log('\n📊 STATUS VÁLIDOS:', Colors.BLUE)
    for status in VALID_STATUSES:
        color_log(f'  • {status}', Colors.WHITE)
    
    color_log('\n💡 EXEMPLOS:', Colors.BLUE)
    color_log('  python scripts/update-task.py pacientes validate_backend_endpoints COMPLETE "Endpoints validados"', Colors.GRAY)
    color_log('  python scripts/update-task.py exames create_exame_service IN_PROGRESS', Colors.GRAY)

def update_task(etapa, task_id, status, notes=''):
    """Atualiza o status de uma tarefa específica"""
    try:
        # Validar parâmetros
        if etapa not in ETAPAS_MAP:
            color_log(f'❌ Etapa inválida: {etapa}', Colors.RED)
            color_log('Etapas disponíveis: ' + ', '.join(ETAPAS_MAP.keys()), Colors.YELLOW)
            return False

        if status not in VALID_STATUSES:
            color_log(f'❌ Status inválido: {status}', Colors.RED)
            color_log('Status válidos: ' + ', '.join(VALID_STATUSES), Colors.YELLOW)
            return False

        # Construir caminho do arquivo
        etapa_config = ETAPAS_MAP[etapa]
        json_path = os.path.join('tasks', etapa_config['folder'], etapa_config['file'])

        # Verificar se arquivo existe
        if not os.path.exists(json_path):
            color_log(f'❌ Arquivo não encontrado: {json_path}', Colors.RED)
            return False

        # Ler arquivo JSON
        with open(json_path, 'r', encoding='utf-8') as f:
            session_data = json.load(f)

        # Encontrar a tarefa
        task = None
        for t in session_data.get('tasks', []):
            if t.get('id') == task_id:
                task = t
                break
        
        if not task:
            color_log(f'❌ Tarefa não encontrada: {task_id}', Colors.RED)
            color_log('\nTarefas disponíveis:', Colors.YELLOW)
            for t in session_data.get('tasks', []):
                color_log(f"  • {t.get('id', 'N/A')} - {t.get('content', 'N/A')}", Colors.GRAY)
            return False

        # Backup do estado anterior
        previous_status = task.get('status', 'UNKNOWN')
        current_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')

        # Atualizar timestamps baseado no status
        if status == 'IN_PROGRESS':
            if not task.get('started_at'):
                task['started_at'] = current_time
            task['completed_at'] = None
        elif status == 'COMPLETE':
            if not task.get('started_at'):
                task['started_at'] = current_time
            task['completed_at'] = current_time
        elif status == 'PENDING':
            task['started_at'] = None
            task['completed_at'] = None
        elif status == 'ERROR':
            if not task.get('started_at'):
                task['started_at'] = current_time
            task['completed_at'] = None

        # Atualizar status e notas
        task['status'] = status
        if notes:
            task['notes'] = notes

        # Recalcular resumo do progresso
        tasks = session_data.get('tasks', [])
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.get('status') == 'COMPLETE'])
        in_progress_tasks = len([t for t in tasks if t.get('status') == 'IN_PROGRESS'])
        pending_tasks = len([t for t in tasks if t.get('status') == 'PENDING'])
        completion_percentage = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

        session_data['progress_summary'] = {
            'total_tasks': total_tasks,
            'completed': completed_tasks,
            'in_progress': in_progress_tasks,
            'pending': pending_tasks,
            'completion_percentage': completion_percentage
        }

        # Atualizar timestamp da sessão
        session_data['session_info']['last_updated'] = current_time

        # Salvar arquivo
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)

        # Exibir resultado
        color_log('\n🔄 TAREFA ATUALIZADA COM SUCESSO!', Colors.GREEN)
        color_log('=' * 50, Colors.GREEN)
        
        color_log(f"\n📋 Etapa: {etapa.upper()}", Colors.CYAN)
        color_log(f"ID: {task.get('id', 'N/A')}", Colors.WHITE)
        color_log(f"Descrição: {task.get('content', 'N/A')}", Colors.WHITE)
        color_log(f"Status: {previous_status} → {status}", Colors.YELLOW)
        
        if notes:
            color_log(f"Notas: {notes}", Colors.WHITE)

        color_log(f"\n📊 Progresso da Etapa: {completion_percentage}% ({completed_tasks}/{total_tasks})", Colors.CYAN)

        # Barra de progresso
        bar_length = 30
        completed_bars = int(completion_percentage * bar_length / 100)
        remaining_bars = bar_length - completed_bars
        progress_bar = '█' * completed_bars + '░' * remaining_bars
        color_log(f"[{progress_bar}] {completion_percentage}%", Colors.CYAN)

        # Próxima tarefa sugerida
        next_task = next((t for t in tasks if t.get('status') == 'PENDING'), None)
        if next_task:
            color_log(f"\n🎯 Próxima Tarefa: {next_task.get('id', 'N/A')}", Colors.YELLOW)
            color_log(f"{next_task.get('content', 'N/A')}", Colors.WHITE)

        # Verificar se etapa está completa
        if completion_percentage == 100:
            color_log(f"\n🎉 PARABÉNS! ETAPA {etapa.upper()} 100% CONCLUÍDA!", Colors.GREEN)

        return True

    except Exception as e:
        color_log(f'❌ Erro ao atualizar tarefa: {str(e)}', Colors.RED)
        return False

def main():
    """Função principal do script"""
    if len(sys.argv) < 4:
        show_usage()
        sys.exit(1)

    etapa = sys.argv[1]
    task_id = sys.argv[2]
    status = sys.argv[3]
    notes = sys.argv[4] if len(sys.argv) > 4 else ''

    if update_task(etapa, task_id, status, notes):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()