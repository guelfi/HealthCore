#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para visualizar o status da sessao de implementacao
Usage: python view_session_status.py
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# [SUBSTITUIR] Nome do arquivo de sessao - ajustar conforme necessario
SESSION_FILE = "template_session_001.json"

# Cores ANSI para terminal
class Colors:
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    MAGENTA = '\033[95m'
    WHITE = '\033[97m'
    GRAY = '\033[90m'
    BOLD = '\033[1m'
    END = '\033[0m'

def load_session_data():
    """Carrega os dados da sessao do arquivo JSON"""
    session_path = Path(SESSION_FILE)
    
    if not session_path.exists():
        print(f"{Colors.RED}❌ Erro: Arquivo de sessao nao encontrado: {SESSION_FILE}{Colors.END}")
        print(f"{Colors.YELLOW}💡 Certifique-se de que o arquivo JSON da sessao existe nesta pasta.{Colors.END}")
        sys.exit(1)
    
    try:
        with open(session_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"{Colors.RED}❌ Erro ao ler arquivo JSON: {e}{Colors.END}")
        sys.exit(1)
    except Exception as e:
        print(f"{Colors.RED}❌ Erro inesperado: {e}{Colors.END}")
        sys.exit(1)

def get_status_icon_and_color(status):
    """Retorna o ícone e cor para um status"""
    status_map = {
        "COMPLETE": ("✅", Colors.GREEN),
        "IN_PROGRESS": ("🔄", Colors.YELLOW),
        "PENDING": ("⏳", Colors.RED),
        "ERROR": ("❌", Colors.RED),
        "CANCELLED": ("🚫", Colors.GRAY)
    }
    return status_map.get(status, ("❓", Colors.WHITE))

def create_progress_bar(percentage, length=50):
    """Cria uma barra de progresso visual"""
    completed_bars = int((percentage / 100) * length)
    remaining_bars = length - completed_bars
    return "█" * completed_bars + "░" * remaining_bars

def format_timestamp(timestamp_str):
    """Formata timestamp para exibição"""
    if not timestamp_str or timestamp_str == "null":
        return "N/A"
    try:
        # Tentar parsear o timestamp
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        return dt.strftime("%d/%m/%Y %H:%M:%S")
    except:
        return timestamp_str

def display_session_status():
    """Exibe o status completo da sessao"""
    session_data = load_session_data()
    
    # Cabeçalho
    print()
    print(f"{Colors.BLUE}{'═' * 63}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}📋 STATUS DA SESSÃO DE IMPLEMENTAÇÃO{Colors.END}")
    print(f"{Colors.BLUE}{'═' * 63}{Colors.END}")
    print()
    
    # Informações da sessão
    session_info = session_data['session_info']
    print(f"{Colors.CYAN}🆔 ID da Sessão: {session_info['session_id']}{Colors.END}")
    print(f"{Colors.CYAN}📝 Descrição: {session_info['description']}{Colors.END}")
    print(f"{Colors.CYAN}🌐 API Endpoint: {session_info['api_endpoint']}{Colors.END}")
    print(f"{Colors.CYAN}🖥️  Frontend Port: {session_info['frontend_port']}{Colors.END}")
    print(f"{Colors.CYAN}📅 Criado em: {format_timestamp(session_info['created_at'])}{Colors.END}")
    print(f"{Colors.CYAN}🔄 Última atualização: {format_timestamp(session_info['last_updated'])}{Colors.END}")
    print()
    
    # Resumo de progresso
    progress = session_data['progress_summary']
    print(f"{Colors.YELLOW}{Colors.BOLD}📊 RESUMO DE PROGRESSO{Colors.END}")
    print(f"{Colors.YELLOW}{'─' * 63}{Colors.END}")
    print(f"{Colors.GREEN}📈 Progresso Geral: {progress['completion_percentage']}%{Colors.END}")
    print(f"{Colors.WHITE}📋 Total de Tarefas: {progress['total_tasks']}{Colors.END}")
    print(f"{Colors.GREEN}✅ Concluídas: {progress['completed']}{Colors.END}")
    print(f"{Colors.YELLOW}🔄 Em Andamento: {progress['in_progress']}{Colors.END}")
    print(f"{Colors.RED}⏳ Pendentes: {progress['pending']}{Colors.END}")
    print()
    
    # Barra de progresso visual
    progress_bar = create_progress_bar(progress['completion_percentage'])
    print(f"{Colors.GREEN}📊 [{progress_bar}] {progress['completion_percentage']}%{Colors.END}")
    print()
    
    # Lista de tarefas
    print(f"{Colors.MAGENTA}{Colors.BOLD}📋 LISTA DE TAREFAS{Colors.END}")
    print(f"{Colors.MAGENTA}{'─' * 63}{Colors.END}")
    
    for task in session_data['tasks']:
        icon, color = get_status_icon_and_color(task['status'])
        
        print(f"{icon} {color}[{task['status']}]{Colors.END} {Colors.WHITE}{task['id']}: {task['content']}{Colors.END}")
        
        if task.get('notes') and task['notes']:
            print(f"   {Colors.GRAY}📝 {task['notes']}{Colors.END}")
        
        if task.get('started_at') and task['started_at']:
            print(f"   {Colors.GRAY}🚀 Iniciado: {format_timestamp(task['started_at'])}{Colors.END}")
        
        if task.get('completed_at') and task['completed_at']:
            print(f"   {Colors.GRAY}🏁 Concluído: {format_timestamp(task['completed_at'])}{Colors.END}")
        
        print()
    
    # Arquivos modificados
    if session_data.get('files_modified') and session_data['files_modified']:
        print(f"{Colors.BLUE}{Colors.BOLD}📁 ARQUIVOS MODIFICADOS{Colors.END}")
        print(f"{Colors.BLUE}{'─' * 63}{Colors.END}")
        for file_path in session_data['files_modified']:
            if file_path and file_path != "[SUBSTITUIR] Lista de arquivos que serão/foram modificados":
                print(f"{Colors.CYAN}📄 {file_path}{Colors.END}")
        print()
    
    # Próximas prioridades
    if session_data.get('next_session_priorities') and session_data['next_session_priorities']:
        print(f"{Colors.GREEN}{Colors.BOLD}🎯 PRÓXIMAS PRIORIDADES{Colors.END}")
        print(f"{Colors.GREEN}{'─' * 63}{Colors.END}")
        for i, priority in enumerate(session_data['next_session_priorities'], 1):
            if priority and not priority.startswith("[SUBSTITUIR]"):
                print(f"{Colors.YELLOW}{i}. {priority}{Colors.END}")
        print()
    
    # Rodapé
    print(f"{Colors.BLUE}{'═' * 63}{Colors.END}")
    print(f"{Colors.GRAY}💡 Use python update_task_status.py para atualizar o status das tarefas{Colors.END}")
    print(f"{Colors.BLUE}{'═' * 63}{Colors.END}")
    print()

def main():
    """Função principal"""
    try:
        display_session_status()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}⚠️  Operação cancelada pelo usuário{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print(f"{Colors.RED}❌ Erro inesperado: {e}{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    main()