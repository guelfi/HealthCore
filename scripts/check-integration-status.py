#!/usr/bin/env python3
"""
📊 Script para Verificar Status da Integração

Execução: python scripts/check-integration-status.py

Este script lê os arquivos JSON de controle e exibe
o status atual de todas as etapas de integração
sem precisar de privilégios administrativos.
"""

import json
import os
import sys

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

# Configuração das etapas
ETAPAS = [
    {
        "name": "Pacientes",
        "folder": "IntegrationPacientes",
        "file": "integration_pacientes_001.json",
        "priority": "ALTA",
        "complexity": "Baixa"
    },
    {
        "name": "Exames",
        "folder": "IntegrationExames", 
        "file": "integration_exames_001.json",
        "priority": "ALTA",
        "complexity": "Média"
    },
    {
        "name": "Usuários",
        "folder": "IntegrationUsuarios",
        "file": "integration_usuarios_001.json",
        "priority": "MÉDIA",
        "complexity": "Média"
    },
    {
        "name": "Médicos",
        "folder": "IntegrationMedicos",
        "file": "integration_medicos_complete_001.json",
        "priority": "ALTA",
        "complexity": "Alta"
    }
]

def get_status_icon(status):
    """Retorna ícone apropriado para o status"""
    icons = {
        'COMPLETE': '✅',
        'IN_PROGRESS': '🔄',
        'PENDING': '⏳',
        'ERROR': '❌'
    }
    return icons.get(status, '📋')

def get_status_color(status):
    """Retorna cor apropriada para o status"""
    colors = {
        'COMPLETE': Colors.GREEN,
        'IN_PROGRESS': Colors.YELLOW,
        'PENDING': Colors.GRAY,
        'ERROR': Colors.RED
    }
    return colors.get(status, Colors.RESET)

def read_json_file(file_path):
    """Lê e retorna conteúdo de arquivo JSON"""
    try:
        if not os.path.exists(file_path):
            return None
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        color_log(f"❌ Erro ao ler {file_path}: {str(e)}", Colors.RED)
        return None

def create_progress_bar(percentage, length=30):
    """Cria barra de progresso visual"""
    completed = int((percentage / 100) * length)
    remaining = length - completed
    return '█' * completed + '░' * remaining

def check_integration_status():
    """Verifica e exibe status de todas as integrações"""
    print('\n🚀 STATUS DAS INTEGRAÇÕES - PROJETO MOBILEMED')
    color_log('=' * 60, Colors.CYAN)

    total_etapas = 0
    etapas_concluidas = 0
    total_tarefas = 0
    tarefas_concluidas = 0

    color_log('\n📋 RESUMO DAS ETAPAS:', Colors.BLUE)

    for index, etapa in enumerate(ETAPAS, 1):
        json_path = os.path.join('tasks', etapa['folder'], etapa['file'])
        data = read_json_file(json_path)
        
        total_etapas += 1
        
        if data:
            progress = data.get('progress_summary', {})
            percentage = progress.get('completion_percentage', 0)
            is_complete = percentage == 100
            
            if is_complete:
                etapas_concluidas += 1
            
            total_tarefas += progress.get('total_tasks', 0)
            tarefas_concluidas += progress.get('completed', 0)

            # Header da etapa
            color_log(f"\n{index}. {etapa['name'].upper()}", Colors.CYAN)
            color_log(f"   Complexidade: {etapa['complexity']} | Prioridade: {etapa['priority']}", Colors.GRAY)
            
            # Progresso
            progress_bar = create_progress_bar(percentage)
            status_color = Colors.GREEN if percentage == 100 else Colors.YELLOW if percentage > 0 else Colors.GRAY
            color_log(f"   Progresso: [{progress_bar}] {percentage}%", status_color)
            color_log(f"   Tarefas: {progress.get('completed', 0)}/{progress.get('total_tasks', 0)} concluídas", Colors.WHITE)
            
            # Status das tarefas por categoria
            if 'tasks' in data:
                tasks_by_status = {}
                for task in data['tasks']:
                    status = task.get('status', 'UNKNOWN')
                    tasks_by_status[status] = tasks_by_status.get(status, 0) + 1

                status_summary = " | ".join([
                    f"{get_status_icon(status)} {count}" 
                    for status, count in tasks_by_status.items()
                ])
                
                color_log(f"   Status: {status_summary}", Colors.WHITE)

            # Próxima prioridade
            if 'next_session_priorities' in data and data['next_session_priorities']:
                color_log(f"   Próximo: {data['next_session_priorities'][0]}", Colors.YELLOW)

        else:
            color_log(f"\n{index}. {etapa['name'].upper()}", Colors.CYAN)
            color_log('   ❌ Arquivo de controle não encontrado', Colors.RED)

    # Resumo geral
    color_log('\n📊 RESUMO GERAL DO PROJETO:', Colors.BLUE)
    overall_progress = int((etapas_concluidas / total_etapas) * 100) if total_etapas > 0 else 0
    overall_progress_bar = create_progress_bar(overall_progress)
    
    color_log(f"Etapas: [{overall_progress_bar}] {overall_progress}%", 
              Colors.GREEN if overall_progress == 100 else Colors.YELLOW)
    color_log(f"{etapas_concluidas}/{total_etapas} etapas concluídas", Colors.WHITE)
    color_log(f"{tarefas_concluidas}/{total_tarefas} tarefas concluídas no total", Colors.WHITE)

    # Status atual
    if overall_progress == 100:
        color_log('\n🎉 PARABÉNS! TODAS AS ETAPAS CONCLUÍDAS!', Colors.GREEN)
        color_log('🚀 Projeto pronto para produção!', Colors.GREEN)
    elif etapas_concluidas > 0:
        color_log(f'\n🔄 Progresso em andamento - {etapas_concluidas} etapa(s) concluída(s)', Colors.YELLOW)
    else:
        color_log('\n⏳ Pronto para começar a primeira etapa (Pacientes)', Colors.CYAN)

    # Comandos úteis
    color_log('\n🛠️  COMANDOS ÚTEIS:', Colors.BLUE)
    color_log('Popular banco com dados de teste:', Colors.WHITE)
    color_log('  python scripts/populate-database.py', Colors.GRAY)
    color_log('\nVerificar status novamente:', Colors.WHITE)
    color_log('  python scripts/check-integration-status.py', Colors.GRAY)
    color_log('\nIniciar frontend:', Colors.WHITE)
    color_log('  npm run dev', Colors.GRAY)

    color_log('\n' + '=' * 60, Colors.CYAN)

if __name__ == "__main__":
    check_integration_status()