#!/usr/bin/env python3
"""
🚀 Script para Popular Banco de Dados com Dados Reais

Execução: python scripts/populate-database.py

Este script adiciona dados de teste reais no banco via API,
permitindo testar a integração frontend-backend com dados reais
sem precisar de privilégios administrativos.
"""

import urllib.request
import urllib.error
import urllib.parse
import json
import socket
import sys

# Configuração da API - testa múltiplos endpoints
API_ENDPOINTS = [
    'http://192.168.15.119:5000',  # Backend no macOS
    'http://localhost:5000',       # Backend local
    'http://127.0.0.1:5000'        # Backend local alternativo
]

API_BASE_URL = None  # Será definido após teste de conectividade

ADMIN_CREDENTIALS = {
    'username': 'guelfi',
    'password': '@246!588'
}

# Endpoint correto descoberto no teste
LOGIN_ENDPOINT = '/auth/login'

# Dados de teste realistas
PACIENTES_TESTE = [
    {
        'nome': 'Maria Silva Santos',
        'documento': '12345678901',
        'dataNascimento': '1985-03-15',
        'telefone': '(11) 98765-4321',
        'email': 'maria.silva@email.com',
        'endereco': 'Rua das Flores, 123 - São Paulo, SP'
    },
    {
        'nome': 'João Pedro Oliveira',
        'documento': '98765432100',
        'dataNascimento': '1978-07-22',
        'telefone': '(21) 99887-6543',
        'email': 'joao.pedro@email.com',
        'endereco': 'Av. Brasil, 456 - Rio de Janeiro, RJ'
    },
    {
        'nome': 'Ana Carolina Ferreira',
        'documento': '45678912300',
        'dataNascimento': '1992-11-08',
        'telefone': '(31) 97654-3210',
        'email': 'ana.carolina@email.com',
        'endereco': 'Rua Minas Gerais, 789 - Belo Horizonte, MG'
    },
    {
        'nome': 'Carlos Eduardo Lima',
        'documento': '78912345600',
        'dataNascimento': '1965-05-30',
        'telefone': '(85) 96543-2109',
        'email': 'carlos.eduardo@email.com',
        'endereco': 'Rua Ceará, 321 - Fortaleza, CE'
    },
    {
        'nome': 'Fernanda Costa Almeida',
        'documento': '32165498700',
        'dataNascimento': '1989-12-03',
        'telefone': '(51) 95432-1098',
        'email': 'fernanda.costa@email.com',
        'endereco': 'Av. Rio Grande, 654 - Porto Alegre, RS'
    }
]

EXAMES_TESTE = [
    {
        'pacienteId': None,  # Will be populated after patient creation
        'modalidade': 'CT',
        'descricao': 'Tomografia computadorizada do tórax',
        'dataExame': '2025-08-25',
        'observacoes': 'Exame realizado com contraste',
        'idempotencyKey': 'exam-001-ct-torax'
    },
    {
        'pacienteId': None,
        'modalidade': 'MR',
        'descricao': 'Ressonância magnética do crânio',
        'dataExame': '2025-08-26',
        'observacoes': 'Investigação de cefaleia',
        'idempotencyKey': 'exam-002-mr-cranio'
    },
    {
        'pacienteId': None,
        'modalidade': 'US',
        'descricao': 'Ultrassom abdominal total',
        'dataExame': '2025-08-27',
        'observacoes': 'Avaliação de dor abdominal',
        'idempotencyKey': 'exam-003-us-abdomen'
    },
    {
        'pacienteId': None,
        'modalidade': 'DX',
        'descricao': 'Radiografia de tórax PA e perfil',
        'dataExame': '2025-08-24',
        'observacoes': 'Controle pós-pneumonia',
        'idempotencyKey': 'exam-004-dx-torax'
    },
    {
        'pacienteId': None,
        'modalidade': 'MG',
        'descricao': 'Mamografia bilateral',
        'dataExame': '2025-08-23',
        'observacoes': 'Rastreamento anual',
        'idempotencyKey': 'exam-005-mg-bilateral'
    }
]

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

def make_request(path, method='GET', data=None, token=None):
    """Faz uma requisição HTTP para a API"""
    global API_BASE_URL
    
    if not API_BASE_URL:
        raise Exception('API_BASE_URL não foi definida. Execute test_connectivity() primeiro.')
    
    try:
        url = f"{API_BASE_URL}{path}"
        headers = {
            'Content-Type': 'application/json'
        }
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        # Preparar dados
        data_bytes = None
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
        
        # Criar requisição
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        
        # Fazer requisição
        response = urllib.request.urlopen(req, timeout=10)
        response_data = response.read().decode('utf-8')
        
        try:
            parsed_data = json.loads(response_data) if response_data else {}
        except:
            parsed_data = response_data
        
        return {
            'status_code': response.getcode(),
            'data': parsed_data,
            'success': 200 <= response.getcode() < 300
        }
        
    except urllib.error.HTTPError as e:
        response_data = e.read().decode('utf-8')
        try:
            parsed_data = json.loads(response_data) if response_data else {}
        except:
            parsed_data = response_data
            
        return {
            'status_code': e.code,
            'data': parsed_data,
            'success': 200 <= e.code < 300
        }
    except Exception as e:
        return {
            'status_code': 0,
            'data': str(e),
            'success': False
        }

def test_connectivity():
    """Testa conectividade com múltiplos endpoints"""
    global API_BASE_URL
    
    color_log('📡 Testando conectividade com múltiplos endpoints...', Colors.CYAN)
    
    for endpoint in API_ENDPOINTS:
        try:
            color_log(f'   Testando: {endpoint}...', Colors.YELLOW)
            
            # Testa primeiro com root da API (sempre existe)
            url = f"{endpoint}/"
            req = urllib.request.Request(url)
            response = urllib.request.urlopen(req, timeout=3)
            
            if 200 <= response.getcode() < 500:
                API_BASE_URL = endpoint
                color_log(f'   ✅ {endpoint} está acessível!', Colors.GREEN)
                color_log(f'   📋 Swagger disponível em: {endpoint}/swagger', Colors.CYAN)
                color_log(f'   ⚠️  Nota: Endpoint /health será criado para futuras verificações', Colors.YELLOW)
                return True
            else:
                color_log(f'   ⚠️  {endpoint} - Status {response.getcode()}', Colors.YELLOW)
                
        except Exception as e:
            color_log(f'   ❌ {endpoint} - {str(e)}', Colors.RED)
    
    color_log('❌ Nenhuma API encontrada!', Colors.RED)
    color_log('', Colors.WHITE)
    color_log('🔧 SOLUÇÕES:', Colors.BLUE)
    color_log('1. Iniciar backend no macOS: ./scripts/api.sh', Colors.WHITE)
    color_log('2. Ou executar: dotnet run --project src/Api', Colors.WHITE)
    color_log('3. Verificar se o IP 192.168.15.119 está correto', Colors.WHITE)
    color_log('4. Testar conectividade: ping 192.168.15.119', Colors.WHITE)
    return False

def populate_database():
    """Função principal para popular o banco de dados"""
    print('\n🚀 INICIANDO POPULAÇÃO DO BANCO DE DADOS\n')
    
    try:
        # 1. Testar conectividade
        is_connected = test_connectivity()
        
        if not is_connected:
            return
        
        color_log(f'✅ Usando API: {API_BASE_URL}', Colors.GREEN)

        # 2. Fazer login com as credenciais corretas
        color_log('\n🔐 Fazendo login...', Colors.CYAN)
        login_response = make_request(LOGIN_ENDPOINT, 'POST', ADMIN_CREDENTIALS)
        
        if not login_response['success'] or not login_response['data'].get('token'):
            color_log('❌ Falha no login!', Colors.RED)
            print('Resposta:', login_response)
            return
        
        token = login_response['data']['token']
        user = login_response['data']['user']
        color_log('✅ Login realizado com sucesso!', Colors.GREEN)
        color_log(f"👤 Usuário: {user['username']} ({'Administrador' if user['role'] == 1 else 'Usuário'})", Colors.CYAN)
        color_log(f"🎫 Token: {token[:30]}...", Colors.GRAY)

        # 3. Popular pacientes
        color_log('\n👥 Criando pacientes de teste...', Colors.CYAN)
        pacientes_ids = []
        
        for i, paciente in enumerate(PACIENTES_TESTE):
            color_log(f"   Criando: {paciente['nome']}...", Colors.YELLOW)
            
            response = make_request('/pacientes', 'POST', paciente, token)
            
            if response['success']:
                pacientes_ids.append(response['data']['id'])
                color_log(f"   ✅ {paciente['nome']} criado com ID: {response['data']['id']}", Colors.GREEN)
            else:
                color_log(f"   ⚠️  {paciente['nome']} - {response['data'].get('message', 'Erro desconhecido')}", Colors.YELLOW)

        # 4. Popular exames (vinculados aos pacientes)
        if pacientes_ids:
            color_log('\n🔬 Criando exames de teste...', Colors.CYAN)
            
            for i, exame in enumerate(EXAMES_TESTE[:len(pacientes_ids)]):
                exame_atual = exame.copy()
                exame_atual['pacienteId'] = pacientes_ids[i]
                
                color_log(f"   Criando: {exame_atual['modalidade']} - {exame_atual['descricao']}...", Colors.YELLOW)
                
                response = make_request('/exames', 'POST', exame_atual, token)
                
                if response['success']:
                    color_log(f"   ✅ Exame {exame_atual['modalidade']} criado com ID: {response['data']['id']}", Colors.GREEN)
                else:
                    color_log(f"   ⚠️  Exame {exame_atual['modalidade']} - {response['data'].get('message', 'Erro desconhecido')}", Colors.YELLOW)

        # 5. Resumo final
        color_log('\n📊 RESUMO DA POPULAÇÃO:', Colors.BLUE)
        color_log(f"   Pacientes processados: {len(PACIENTES_TESTE)}", Colors.WHITE)
        color_log(f"   Pacientes criados com sucesso: {len(pacientes_ids)}", Colors.GREEN)
        color_log(f"   Exames processados: {min(len(EXAMES_TESTE), len(pacientes_ids))}", Colors.WHITE)
        
        if pacientes_ids:
            color_log('\n🎉 DADOS POPULADOS COM SUCESSO!', Colors.GREEN)
            color_log('   Agora você pode testar a integração com dados reais!', Colors.CYAN)

    except Exception as e:
        color_log(f'\n❌ ERRO DURANTE A EXECUÇÃO: {str(e)}', Colors.RED)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    populate_database()