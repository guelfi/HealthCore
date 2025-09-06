#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para atualizar status de tarefas da sessao de implementacao
Usage: python update_task_status.py --task-id "task_id" --status "COMPLETE" --notes "Optional notes"
"""

import json
import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

# [SUBSTITUIR] Nome do arquivo de sessao - ajustar conforme necessario
SESSION_FILE = "template_session_001.json"

VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETE", "ERROR", "CANCELLED"]

def load_session_data():
    """Carrega os dados da sessao do arquivo JSON"""
    session_path = Path(SESSION_FILE)
    
    if not session_path.exists():
        print(f"❌ Erro: Arquivo de sessao nao encontrado: {SESSION_FILE}")
        print("💡 Certifique-se de que o arquivo JSON da sessao existe nesta pasta.")
        sys.exit(1)
    
    try:
        with open(session_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao ler arquivo JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        sys.exit(1)

def save_session_data(data):
    """Salva os dados da sessao no arquivo JSON"""
    try:
        with open(SESSION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"❌ Erro ao salvar arquivo: {e}")
        sys.exit(1)

def find_task(session_data, task_id):
    """Encontra uma tarefa pelo ID"""
    for task in session_data['tasks']:
        if task['id'] == task_id:
            return task
    return None

def get_current_timestamp():
    """Retorna o timestamp atual no formato ISO"""
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

def calculate_progress_summary(tasks):
    """Calcula o resumo de progresso das tarefas"""
    total_tasks = len(tasks)
    completed = sum(1 for task in tasks if task['status'] == 'COMPLETE')
    in_progress = sum(1 for task in tasks if task['status'] == 'IN_PROGRESS')
    pending = sum(1 for task in tasks if task['status'] == 'PENDING')
    
    completion_percentage = round((completed / total_tasks) * 100, 2) if total_tasks > 0 else 0
    
    return {
        'total_tasks': total_tasks,
        'completed': completed,
        'in_progress': in_progress,
        'pending': pending,
        'completion_percentage': completion_percentage
    }

def update_task_status(task_id, status, notes=""):
    """Atualiza o status de uma tarefa"""
    # Validar status
    if status not in VALID_STATUSES:
        print(f"❌ Status inválido: {status}")
        print(f"💡 Status válidos: {', '.join(VALID_STATUSES)}")
        sys.exit(1)
    
    # Carregar dados da sessao
    session_data = load_session_data()
    
    # Encontrar a tarefa
    task = find_task(session_data, task_id)
    if not task:
        print(f"❌ Tarefa nao encontrada: {task_id}")
        print("💡 Tarefas disponíveis:")
        for t in session_data['tasks']:
            print(f"  - {t['id']}: {t['content']}")
        sys.exit(1)
    
    # Salvar status anterior
    old_status = task['status']
    
    # Atualizar status
    task['status'] = status
    
    # Atualizar timestamps
    current_time = get_current_timestamp()
    
    if status == "IN_PROGRESS" and not task.get('started_at'):
        task['started_at'] = current_time
    
    if status == "COMPLETE":
        task['completed_at'] = current_time
        if not task.get('started_at'):
            task['started_at'] = current_time
    
    # Adicionar notas se fornecidas
    if notes:
        task['notes'] = notes
    
    # Atualizar timestamp da sessao
    session_data['session_info']['last_updated'] = current_time
    
    # Recalcular resumo de progresso
    session_data['progress_summary'] = calculate_progress_summary(session_data['tasks'])
    
    # Salvar dados atualizados
    save_session_data(session_data)
    
    # Exibir resultado
    progress = session_data['progress_summary']
    print("✅ Tarefa atualizada com sucesso!")
    print(f"📋 Tarefa: {task['content']}")
    print(f"🔄 Status: {old_status} → {status}")
    if notes:
        print(f"📝 Notas: {notes}")
    print(f"📊 Progresso geral: {progress['completion_percentage']}% ({progress['completed']}/{progress['total_tasks']} tarefas concluídas)")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Atualiza o status de uma tarefa na sessao de implementacao",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python update_task_status.py --task-id "task_example_1" --status "IN_PROGRESS"
  python update_task_status.py --task-id "task_example_2" --status "COMPLETE" --notes "Implementacao concluida com sucesso"
  python update_task_status.py --task-id "task_example_3" --status "ERROR" --notes "Erro encontrado durante implementacao"
        """
    )
    
    parser.add_argument(
        '--task-id', 
        required=True, 
        help='ID da tarefa a ser atualizada'
    )
    
    parser.add_argument(
        '--status', 
        required=True, 
        choices=VALID_STATUSES,
        help='Novo status da tarefa'
    )
    
    parser.add_argument(
        '--notes', 
        default="",
        help='Notas opcionais sobre a tarefa'
    )
    
    args = parser.parse_args()
    
    update_task_status(args.task_id, args.status, args.notes)

if __name__ == "__main__":
    main()