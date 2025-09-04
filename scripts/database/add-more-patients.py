#!/usr/bin/env python3
"""
🏥 Script para Adicionar Mais Pacientes - Teste de Paginação
Execução: python scripts/add-more-patients.py

Este script adiciona 20 pacientes extras ao banco de dados para testar a funcionalidade
de paginação do sistema. Os pacientes terão dados realistas brasileiros.
"""

import json
import random
import requests
import sys
from datetime import datetime, timedelta

# Configuração da API
API_ENDPOINTS = [
    'http://192.168.15.119:5000',  # Backend no macOS
    'http://localhost:5000',       # Backend local
    'http://127.0.0.1:5000'        # Backend local alternativo
]

ADMIN_CREDENTIALS = {
    'username': 'guelfi',
    'password': '@246!588'
}

# Cores para console
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'

def color_log(message, color=Colors.RESET):
    """Imprime mensagem colorida no console"""
    print(f"{color}{message}{Colors.RESET}")

def generate_brazilian_phone():
    """Gera um número de telefone brasileiro realista"""
    ddd = random.choice([
        '11', '21', '31', '41', '51', '61', '71', '81', '91',
        '12', '22', '32', '42', '53', '62', '73', '82', '92',
        '13', '24', '33', '43', '54', '63', '74', '83', '93',
        '14', '27', '34', '44', '55', '64', '75', '84', '94',
        '15', '28', '35', '45', '65', '77', '85', '95',
        '16', '37', '46', '66', '79', '86', '96',
        '17', '38', '67', '87', '97',
        '18', '68', '88', '98',
        '19', '69', '89', '99'
    ])
    prefix = random.randint(90000, 99999)
    suffix = random.randint(1000, 9999)
    return f"({ddd}) {prefix}-{suffix}"

def generate_brazilian_cpf():
    """Gera um CPF brasileiro válido"""
    def calculate_digit(digits):
        total = sum([digit * (len(digits) + 1 - i) for i, digit in enumerate(digits)])
        digit = 11 - (total % 11)
        return 0 if digit > 9 else digit

    digits = [random.randint(0, 9) for _ in range(9)]
    digits.append(calculate_digit(digits))
    digits.append(calculate_digit(digits))
    
    cpf = ''.join(map(str, digits))
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

def generate_brazilian_address():
    """Gera um endereço brasileiro realista"""
    streets = [
        "Rua das Flores", "Avenida Brasil", "Rua Minas Gerais", "Avenida Rio Grande",
        "Rua Ceará", "Avenida Paulista", "Rua Oscar Freire", "Avenida Atlântica",
        "Rua Augusta", "Avenida Copacabana", "Rua Visconde de Pirajá", "Avenida Vieira Souto",
        "Rua Farme de Amoedo", "Avenida Nossa Senhora de Copacabana", "Rua Barão de Jaguaribe",
        "Avenida Princesa Isabel", "Rua Gonçalves Ledo", "Avenida Brigadeiro Faria Lima",
        "Rua Bela Cintra", "Avenida Europa", "Rua Estados Unidos", "Avenida das Américas",
        "Rua Voluntários da Pátria", "Avenida Getúlio Vargas", "Rua Sete de Setembro",
        "Avenida Afonso Pena", "Rua da Bahia", "Avenida Amazonas", "Rua Pará",
        "Avenida Raja Gabaglia", "Rua Pernambuco", "Avenida do Contorno"
    ]
    
    cities_states = [
        "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS",
        "Curitiba, PR", "Salvador, BA", "Fortaleza, CE", "Recife, PE", "Brasília, DF",
        "Belém, PA", "Manaus, AM", "Goiânia, GO", "Campinas, SP", "São Luís, MA",
        "Maceió, AL", "Natal, RN", "Teresina, PI", "João Pessoa, PB", "Aracaju, SE",
        "Campo Grande, MS", "Cuiabá, MT", "Florianópolis, SC", "Vitória, ES",
        "São José dos Campos, SP", "Ribeirão Preto, SP", "Uberlândia, MG"
    ]
    
    street = random.choice(streets)
    number = random.randint(1, 2000)
    city_state = random.choice(cities_states)
    
    return f"{street}, {number} - {city_state}"

def generate_patient_data(index):
    """Gera dados realistas para um paciente brasileiro"""
    # Nomes comuns brasileiros
    first_names = [
        "Maria", "José", "Ana", "Carlos", "Francisca", "Antônio", "Adriana", "Paulo",
        "Juliana", "Pedro", "Fernanda", "Lucas", "Mariana", "Luiz", "Rita", "Marcos",
        "Patrícia", "Roberto", "Camila", "Eduardo", "Renata", "Ricardo", "Aline",
        "Daniel", "Simone", "Alexandre", "Carla", "Marcelo", "Tatiane", "Fábio"
    ]
    
    last_names = [
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
        "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Carvalho", "Almeida",
        "Nascimento", "Araújo", "Melo", "Barros", "Freitas", "Pinto", "Vieira",
        "Monteiro", "Castro", "Campos", "Cardoso", "Teixeira", "Moura", "Ramos",
        "Reis", "Machado", "Barbosa", "Brandão", "Correia", "Mendes", "Farias"
    ]
    
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    full_name = f"{first_name} {last_name}"
    
    # Gerar data de nascimento entre 18 e 80 anos
    today = datetime.now()
    start_date = today - timedelta(days=80*365)
    end_date = today - timedelta(days=18*365)
    random_date = start_date + timedelta(
        seconds=random.randint(0, int((end_date - start_date).total_seconds()))
    )
    
    return {
        "nome": full_name,
        "documento": generate_brazilian_cpf(),
        "dataNascimento": random_date.strftime("%Y-%m-%d"),
        "telefone": generate_brazilian_phone(),
        "email": f"{first_name.lower()}.{last_name.lower()}{index}@email.com",
        "endereco": generate_brazilian_address()
    }

def test_connectivity():
    """Testa conectividade com os endpoints da API"""
    color_log("📡 Testando conectividade com os endpoints da API...", Colors.CYAN)
    
    for endpoint in API_ENDPOINTS:
        try:
            color_log(f"   Testando: {endpoint}...", Colors.YELLOW)
            response = requests.get(f"{endpoint}/", timeout=3)
            if response.status_code < 500:  # Qualquer status < 500 indica que o endpoint existe
                color_log(f"   ✅ {endpoint} está acessível!", Colors.GREEN)
                color_log(f"   📋 Swagger disponível em: {endpoint}/swagger", Colors.CYAN)
                return endpoint
            else:
                color_log(f"   ⚠️  {endpoint} - Status: {response.status_code}", Colors.YELLOW)
        except requests.exceptions.RequestException as e:
            color_log(f"   ❌ {endpoint} - {str(e)}", Colors.RED)
    
    color_log("❌ Nenhuma API encontrada!", Colors.RED)
    color_log("", Colors.WHITE)
    color_log("🔧 SOLUÇÕES:", Colors.BLUE)
    color_log("1. Iniciar backend no macOS: ./scripts/api.sh", Colors.WHITE)
    color_log("2. Ou executar: dotnet run --project src/Api", Colors.WHITE)
    color_log("3. Verificar se o IP 192.168.15.119 está correto", Colors.WHITE)
    color_log("4. Testar conectividade: ping 192.168.15.119", Colors.WHITE)
    return None

def make_request(url, method='GET', data=None, token=None):
    """Faz requisições HTTP para a API"""
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Método HTTP não suportado: {method}")
        
        return {
            'statusCode': response.status_code,
            'data': response.json() if response.content else {},
            'success': response.status_code >= 200 and response.status_code < 300
        }
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 0,
            'data': {'message': str(e)},
            'success': False
        }

def add_patients(api_base_url, token, num_patients=20):
    """Adiciona pacientes ao banco de dados"""
    color_log(f"\n👥 Criando {num_patients} pacientes de teste para paginação...", Colors.CYAN)
    successful_creations = 0
    
    for i in range(1, num_patients + 1):
        patient_data = generate_patient_data(i)
        color_log(f"   Criando: {patient_data['nome']}...", Colors.YELLOW)
        
        response = make_request(
            f"{api_base_url}/pacientes", 
            'POST', 
            patient_data, 
            token
        )
        
        if response['success']:
            successful_creations += 1
            color_log(f"   ✅ {patient_data['nome']} criado com ID: {response['data'].get('id', 'N/A')}", Colors.GREEN)
        else:
            error_msg = response['data'].get('message', 'Erro desconhecido')
            color_log(f"   ⚠️  {patient_data['nome']} - {error_msg}", Colors.YELLOW)
    
    return successful_creations

def main():
    """Função principal"""
    print("\n🏥 INICIANDO ADIÇÃO DE PACIENTES PARA TESTE DE PAGINAÇÃO\n")
    
    try:
        # 1. Testar conectividade
        api_base_url = test_connectivity()
        if not api_base_url:
            return False
        
        color_log(f"✅ Usando API: {api_base_url}", Colors.GREEN)

        # 2. Fazer login
        color_log("\n🔐 Fazendo login...", Colors.CYAN)
        login_response = make_request(
            f"{api_base_url}/auth/login", 
            'POST', 
            ADMIN_CREDENTIALS
        )
        
        if not login_response['success'] or not login_response['data'].get('token'):
            color_log("❌ Falha no login!", Colors.RED)
            print("Resposta:", login_response)
            return False
        
        token = login_response['data']['token']
        user = login_response['data'].get('user', {})
        color_log("✅ Login realizado com sucesso!", Colors.GREEN)
        color_log(f"👤 Usuário: {user.get('username', 'N/A')} ({'Administrador' if user.get('role') == 1 else 'Usuário'})", Colors.CYAN)
        color_log(f"🎫 Token: {token[:30]}...", Colors.WHITE)

        # 3. Adicionar pacientes
        successful = add_patients(api_base_url, token, 20)
        
        # 4. Resumo final
        color_log(f"\n📊 RESUMO DA ADIÇÃO:", Colors.BLUE)
        color_log(f"   Pacientes solicitados: 20", Colors.WHITE)
        color_log(f"   Pacientes criados com sucesso: {successful}", Colors.GREEN)
        
        if successful > 0:
            color_log(f"\n🎉 {successful} PACIENTES ADICIONADOS COM SUCESSO!", Colors.GREEN)
            color_log("   Agora você pode testar a paginação com mais de 20 pacientes!", Colors.CYAN)
            return True
        else:
            color_log("\n❌ Nenhum paciente foi adicionado.", Colors.RED)
            return False

    except Exception as e:
        color_log(f"\n❌ ERRO DURANTE A EXECUÇÃO: {str(e)}", Colors.RED)
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)