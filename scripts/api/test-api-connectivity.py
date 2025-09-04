#!/usr/bin/env python3
"""
🌐 Script para Testar Conectividade da API

Execução: python scripts/test-api-connectivity.py

Este script testa a conectividade com diferentes endpoints da API
e fornece instruções para resolver problemas de conectividade.
"""

import urllib.request
import urllib.error
import socket
import sys

# Endpoints para testar
API_ENDPOINTS = [
    'http://192.168.15.119:5000',  # Backend no macOS
    'http://localhost:5000',       # Backend local
    'http://127.0.0.1:5000'        # Backend local alternativo
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
    WHITE = '\033[37m'  # Adicionando a cor branca que estava faltando

def color_log(message, color=Colors.RESET):
    """Imprime mensagem colorida no console"""
    print(f"{color}{message}{Colors.RESET}")

def test_endpoint(endpoint):
    """Testa um endpoint específico"""
    try:
        url = f"{endpoint}/"
        req = urllib.request.Request(url)
        response = urllib.request.urlopen(req, timeout=3)
        data = response.read().decode('utf-8')
        return {
            'success': 200 <= response.getcode() < 300,
            'status': response.getcode(),
            'data': data[:100] + '...' if len(data) > 100 else data,
            'endpoint': endpoint
        }
    except urllib.error.HTTPError as e:
        return {
            'success': False,
            'error': f'HTTP {e.code}: {e.reason}',
            'endpoint': endpoint
        }
    except urllib.error.URLError as e:
        return {
            'success': False,
            'error': str(e.reason),
            'endpoint': endpoint
        }
    except socket.timeout:
        return {
            'success': False,
            'error': 'Timeout (3s)',
            'endpoint': endpoint
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'endpoint': endpoint
        }

def test_all_endpoints():
    """Testa todos os endpoints configurados"""
    print('\n🌐 TESTE DE CONECTIVIDADE DA API')
    color_log('=' * 50, Colors.CYAN)

    working_endpoint = None

    for endpoint in API_ENDPOINTS:
        color_log(f"\n📡 Testando: {endpoint}", Colors.CYAN)
        
        result = test_endpoint(endpoint)
        
        if result['success']:
            color_log('✅ SUCESSO! API está rodando', Colors.GREEN)
            color_log(f"   Status: {result['status']}", Colors.WHITE)
            if 'data' in result:
                color_log(f"   Resposta: {result['data']}", Colors.GRAY)
            working_endpoint = endpoint
            break
        else:
            color_log(f"❌ FALHOU: {result['error']}", Colors.RED)

    print('\n')
    color_log('📊 RESUMO:', Colors.BLUE)
    
    if working_endpoint:
        color_log(f'✅ API encontrada em: {working_endpoint}', Colors.GREEN)
        color_log('🚀 Agora você pode executar o script de população:', Colors.CYAN)
        color_log('   python scripts/populate-database.py', Colors.WHITE)
    else:
        color_log('❌ Nenhuma API encontrada!', Colors.RED)
        
        color_log('\n🔧 SOLUÇÕES:', Colors.BLUE)
        color_log('1. 🖥️  No macOS, iniciar o backend:', Colors.WHITE)
        color_log('   cd [projeto] && ./scripts/api.sh', Colors.GRAY)
        color_log('   OU: dotnet run --project src/Api', Colors.GRAY)
        
        color_log('\n2. 🌐 Verificar conectividade de rede:', Colors.WHITE)
        color_log('   ping 192.168.15.119', Colors.GRAY)
        
        color_log('\n3. 🔍 Verificar se o IP está correto:', Colors.WHITE)
        color_log('   O backend está realmente no IP 192.168.15.119?', Colors.GRAY)
        
        color_log('\n4. 🚪 Verificar portas:', Colors.WHITE)
        color_log('   A porta 5000 está aberta no macOS?', Colors.GRAY)
        
        color_log('\n5. 🛡️  Verificar firewall:', Colors.WHITE)
        color_log('   O firewall do macOS está bloqueando a porta 5000?', Colors.GRAY)

    color_log('\n' + '=' * 50, Colors.CYAN)
    return working_endpoint

if __name__ == "__main__":
    test_all_endpoints()