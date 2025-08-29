#!/usr/bin/env python3
"""
Script para visualizar status da sessão de integração de Usuários
Baseado no modelo de sucesso das integrações anteriores
"""

import json
import os
import sys

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

def get_status_color(status):
    """Retorna cor apropriada para o status"""
    colors = {
        "COMPLETE": Colors.GREEN,
        "IN_PROGRESS": Colors.YELLOW,
        "PENDING": Colors.GRAY,
        "ERROR": Colors.RED
    }
    return colors.get(status, Colors.WHITE)

def get_status_icon(status):
    """Retorna ícone apropriado para o status"""
    icons = {
        "COMPLETE": "✅",
        "IN_PROGRESS": "🔄",
        "PENDING": "⏳",
        "ERROR": "❌"
    }
    return icons.get(status, "📋")

def create_progress_bar(percentage, length=40):
    """Cria barra de progresso visual"""
    completed = int((percentage / 100) * length)
    remaining = length - completed
    return '█' * completed + '░' * remaining

def main():
    json_file = "tasks/05-IntegrationUsuarios/integration_usuarios_001.json"
    
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

    # Header
    color_log("\n🚀 STATUS DA INTEGRAÇÃO DE USUÁRIOS", Colors.CYAN)
    color_log("=" * 60, Colors.CYAN)

    # Informações da sessão
    session_info = session_data.get("session_info", {})
    color_log("\n📋 INFORMAÇÕES DA SESSÃO", Colors.YELLOW)
    color_log(f"ID da Sessão: {session_info.get('session_id', 'N/A')}", Colors.WHITE)
    color_log(f"Etapa: {session_info.get('etapa', 'N/A')}", Colors.WHITE)
    color_log(f"Complexidade: {session_info.get('complexity', 'N/A')}", Colors.WHITE)
    color_log(f"Prioridade: {session_info.get('priority', 'N/A')}", Colors.WHITE)
    color_log(f"Estimativa: {session_info.get('estimated_hours', 'N/A')}", Colors.WHITE)
    color_log(f"Última Atualização: {session_info.get('last_updated', 'N/A')}", Colors.WHITE)

    # Resumo do progresso
    progress = session_data.get("progress_summary", {})
    color_log("\n📊 RESUMO DO PROGRESSO", Colors.YELLOW)
    color_log(f"Progresso Geral: {progress.get('completion_percentage', 0)}% ({progress.get('completed', 0)}/{progress.get('total_tasks', 0)} tarefas concluídas)", Colors.CYAN)

    # Barra de progresso
    completion_percentage = progress.get('completion_percentage', 0)
    progress_bar = create_progress_bar(completion_percentage)
    color_log(f"[{progress_bar}] {completion_percentage}%", Colors.CYAN)

    # Estatísticas por status
    color_log("\n📈 DISTRIBUIÇÃO DE TAREFAS", Colors.YELLOW)
    color_log(f"✅ Concluídas: {progress.get('completed', 0)}", Colors.GREEN)
    color_log(f"🔄 Em Progresso: {progress.get('in_progress', 0)}", Colors.YELLOW)
    color_log(f"⏳ Pendentes: {progress.get('pending', 0)}", Colors.GRAY)

    # Lista de tarefas por categoria
    color_log("\n📋 TAREFAS POR CATEGORIA", Colors.YELLOW)

    tasks = session_data.get("tasks", [])
    tasks_by_category = {}
    for task in tasks:
        category = task.get("category", "unknown")
        if category not in tasks_by_category:
            tasks_by_category[category] = []
        tasks_by_category[category].append(task)

    for category_name, category_tasks in tasks_by_category.items():
        completed_in_category = len([t for t in category_tasks if t.get("status") == "COMPLETE"])
        
        color_log(f"\n📁 {category_name} ({completed_in_category}/{len(category_tasks)} concluídas)", Colors.MAGENTA)
        
        for task in category_tasks:
            icon = get_status_icon(task.get("status", "UNKNOWN"))
            color = get_status_color(task.get("status", "UNKNOWN"))
            task_info = f"{icon} [{task.get('status', 'UNKNOWN')}] {task.get('content', 'N/A')}"
            
            if task.get("estimated_time"):
                task_info += f" ⏱️ {task.get('estimated_time')}"
            
            color_log(f"  {task_info}", color)
            
            if task.get("notes") and task.get("notes") != "":
                color_log(f"    💡 {task.get('notes')}", Colors.GRAY)

    # Próximas prioridades
    next_priorities = session_data.get("next_session_priorities", [])
    if next_priorities:
        color_log("\n🎯 PRÓXIMAS PRIORIDADES", Colors.YELLOW)
        for priority in next_priorities:
            color_log(f"• {priority}", Colors.WHITE)

    # Checklist de validação
    validation_checklist = session_data.get("validation_checklist", [])
    if validation_checklist:
        color_log("\n✅ CHECKLIST DE VALIDAÇÃO", Colors.YELLOW)
        for item in validation_checklist:
            color_log(item, Colors.GRAY)

    # Critérios de sucesso
    success_criteria = session_data.get("success_criteria", {})
    if success_criteria:
        color_log("\n🎯 CRITÉRIOS DE SUCESSO", Colors.YELLOW)

        functional = success_criteria.get("functional", [])
        if functional:
            color_log("\n🔧 Funcionais:", Colors.CYAN)
            for criteria in functional:
                color_log(f"  • {criteria}", Colors.WHITE)

        technical = success_criteria.get("technical", [])
        if technical:
            color_log("\n⚙️ Técnicos:", Colors.CYAN)
            for criteria in technical:
                color_log(f"  • {criteria}", Colors.WHITE)

        ux = success_criteria.get("ux", [])
        if ux:
            color_log("\n🎨 UX:", Colors.CYAN)
            for criteria in ux:
                color_log(f"  • {criteria}", Colors.WHITE)

    # Arquivos a serem modificados
    files_to_modify = session_data.get("files_to_modify", [])
    if files_to_modify:
        color_log("\n📁 ARQUIVOS A SEREM MODIFICADOS", Colors.YELLOW)
        for file in files_to_modify:
            color_log(f"• {file}", Colors.CYAN)

    # Status das dependências
    dependencies = session_data.get("dependencies", {})
    if dependencies:
        color_log("\n🔗 STATUS DAS DEPENDÊNCIAS", Colors.YELLOW)
        for dep_name, dep_value in dependencies.items():
            status = "✅" if dep_value is True else "❌" if dep_value is False else "ℹ️"
            color_log(f"{status} {dep_name}: {dep_value}", Colors.WHITE)

    # Comandos úteis
    color_log("\n🛠️ COMANDOS ÚTEIS", Colors.YELLOW)
    color_log("Atualizar status de tarefa:", Colors.WHITE)
    color_log("  python scripts/update-task.py usuarios task_id COMPLETE \"Descrição\"", Colors.GRAY)
    color_log("\nTestar conectividade:", Colors.WHITE)
    color_log("  python scripts/test-api-connectivity.py", Colors.GRAY)
    color_log("\nIniciar frontend:", Colors.WHITE)
    color_log("  npm run dev", Colors.GRAY)

    # Footer
    color_log("\n", Colors.WHITE)
    color_log("=" * 60, Colors.CYAN)
    color_log("🚀 Pronto para começar a integração de Usuários!", Colors.GREEN)
    color_log("📊 Execute as tarefas na ordem e atualize o progresso regularmente.", Colors.WHITE)
    color_log("=" * 60, Colors.CYAN)

if __name__ == "__main__":
    main()