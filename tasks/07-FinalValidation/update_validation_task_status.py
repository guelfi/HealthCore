#!/usr/bin/env python3
"""
Script para atualizar status de tarefas na validação final do projeto
Baseado no modelo de sucesso das integrações anteriores
"""

import json
import os
import sys
from datetime import datetime

# Cores para output
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    MAGENTA = '\033[35m'
    WHITE = '\033[37m'
    GRAY = '\033[90m'

def color_log(message, color=Colors.WHITE):
    """Imprime mensagem colorida no console"""
    print(f"{color}{message}{Colors.RESET}")

def create_progress_bar(percentage, length=30):
    """Cria barra de progresso visual"""
    completed = int((percentage / 100) * length)
    remaining = length - completed
    return '█' * completed + '░' * remaining

def main():
    if len(sys.argv) < 3:
        color_log("Uso: python update_validation_task_status.py <task_id> <status> [notes]", Colors.YELLOW)
        color_log("Exemplo: python update_validation_task_status.py test_pacientes_crud COMPLETE \"CRUD de pacientes validado\"", Colors.GRAY)
        color_log("\nStatus válidos: PENDING, IN_PROGRESS, COMPLETE, ERROR", Colors.WHITE)
        sys.exit(1)

    task_id = sys.argv[1]
    status = sys.argv[2].upper()
    notes = sys.argv[3] if len(sys.argv) > 3 else ""

    # Validar status
    valid_statuses = ["PENDING", "IN_PROGRESS", "COMPLETE", "ERROR"]
    if status not in valid_statuses:
        color_log(f"❌ Status inválido: {status}", Colors.RED)
        color_log("Status válidos: " + ", ".join(valid_statuses), Colors.YELLOW)
        sys.exit(1)

    json_file = "tasks/07-FinalValidation/final_validation_001.json"

    # Verificar se o arquivo existe
    if not os.path.exists(json_file):
        color_log(f"❌ Arquivo não encontrado: {json_file}", Colors.RED)
        sys.exit(1)

    # Carregar dados JSON
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            session_data = json.load(f)
    except Exception as e:
        color_log(f"❌ Erro ao ler arquivo JSON: {str(e)}", Colors.RED)
        sys.exit(1)

    # Encontrar a tarefa
    task = None
    for t in session_data.get("tasks", []):
        if t.get("id") == task_id:
            task = t
            break

    if not task:
        color_log(f"❌ Tarefa não encontrada: {task_id}", Colors.RED)
        color_log("\nTarefas disponíveis:", Colors.YELLOW)
        for t in session_data.get("tasks", []):
            color_log(f"• {t.get('id', 'N/A')} - {t.get('content', 'N/A')}", Colors.GRAY)
        sys.exit(1)

    # Backup do estado anterior
    previous_status = task.get("status", "UNKNOWN")
    current_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')

    # Atualizar timestamps baseado no status
    if status == "IN_PROGRESS":
        if not task.get("started_at"):
            task["started_at"] = current_time
        task["completed_at"] = None
    elif status == "COMPLETE":
        if not task.get("started_at"):
            task["started_at"] = current_time
        task["completed_at"] = current_time
    elif status == "PENDING":
        task["started_at"] = None
        task["completed_at"] = None
    elif status == "ERROR":
        if not task.get("started_at"):
            task["started_at"] = current_time
        task["completed_at"] = None

    # Atualizar status e notas
    task["status"] = status
    if notes != "":
        task["notes"] = notes

    # Recalcular resumo do progresso
    tasks = session_data.get("tasks", [])
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.get("status") == "COMPLETE"])
    in_progress_tasks = len([t for t in tasks if t.get("status") == "IN_PROGRESS"])
    pending_tasks = len([t for t in tasks if t.get("status") == "PENDING"])
    error_tasks = len([t for t in tasks if t.get("status") == "ERROR"])
    completion_percentage = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    session_data["progress_summary"] = {
        "total_tasks": total_tasks,
        "completed": completed_tasks,
        "in_progress": in_progress_tasks,
        "pending": pending_tasks,
        "completion_percentage": completion_percentage
    }

    # Atualizar timestamp da sessão
    session_data["session_info"]["last_updated"] = current_time

    # Salvar o arquivo atualizado
    try:
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        color_log(f"❌ Erro ao salvar arquivo: {str(e)}", Colors.RED)
        sys.exit(1)

    # Exibir resultado
    color_log("\n🔄 TAREFA ATUALIZADA COM SUCESSO", Colors.GREEN)
    color_log("=" * 50, Colors.GREEN)

    color_log("\n📋 Detalhes da Tarefa:", Colors.YELLOW)
    color_log(f"ID: {task.get('id', 'N/A')}", Colors.WHITE)
    color_log(f"Descrição: {task.get('content', 'N/A')}", Colors.WHITE)
    color_log(f"Status Anterior: {previous_status}", Colors.GRAY)
    color_log(f"Status Atual: {task.get('status', 'N/A')}", Colors.CYAN)

    if notes != "":
        color_log(f"Notas: {task.get('notes', 'N/A')}", Colors.WHITE)

    color_log("\n⏱️ Timestamps:", Colors.YELLOW)
    if task.get("started_at"):
        color_log(f"Iniciado em: {task.get('started_at')}", Colors.WHITE)
    if task.get("completed_at"):
        color_log(f"Concluído em: {task.get('completed_at')}", Colors.WHITE)

    color_log("\n📊 Progresso Atualizado:", Colors.YELLOW)
    color_log(f"Total de Tarefas: {total_tasks}", Colors.WHITE)
    color_log(f"Concluídas: {completed_tasks}", Colors.GREEN)
    color_log(f"Em Progresso: {in_progress_tasks}", Colors.YELLOW)
    color_log(f"Pendentes: {pending_tasks}", Colors.GRAY)

    if error_tasks > 0:
        color_log(f"Com Erro: {error_tasks}", Colors.RED)

    color_log(f"Progresso Geral: {completion_percentage}%", Colors.CYAN)

    # Barra de progresso visual
    progress_bar = create_progress_bar(completion_percentage)
    color_log(f"[{progress_bar}] {completion_percentage}%", Colors.CYAN)

    # Próxima tarefa sugerida
    next_task = next((t for t in tasks if t.get("status") == "PENDING"), None)
    if next_task:
        color_log("\n🎯 Próxima Tarefa Sugerida:", Colors.YELLOW)
        color_log(f"• {next_task.get('id', 'N/A')} - {next_task.get('content', 'N/A')}", Colors.WHITE)
        if next_task.get("estimated_time"):
            color_log(f"  ⏱️ Tempo estimado: {next_task.get('estimated_time')}", Colors.GRAY)

    # Comandos úteis
    color_log("\n🛠️ Comandos Úteis:", Colors.YELLOW)
    color_log("Visualizar status completo:", Colors.WHITE)
    color_log("  python tasks/07-FinalValidation/view_final_validation_status.py", Colors.GRAY)

    if next_task:
        color_log("\nIniciar próxima tarefa:", Colors.WHITE)
        color_log(f"  python tasks/07-FinalValidation/update_validation_task_status.py \"{next_task.get('id', 'N/A')}\" IN_PROGRESS \"Iniciando validação\"", Colors.GRAY)

    # Verificar se a etapa está completa
    if completion_percentage == 100:
        color_log("\n🎉 PARABÉNS! VALIDAÇÃO FINAL 100% CONCLUÍDA!", Colors.GREEN)
        color_log("🚀 Projeto pronto para produção!", Colors.GREEN)

    color_log("\n", Colors.WHITE)

if __name__ == "__main__":
    main()