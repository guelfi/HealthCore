# Instruções Específicas para macOS - Módulo Médicos

## 🍎 Pré-requisitos

### Verificar Ambiente Existente
```bash
# Verificar .NET SDK (já instalado)
dotnet --version
# Deve retornar: 8.0.x ou superior

# Verificar Entity Framework Tools
dotnet ef --version
# Deve retornar: 8.0.x ou superior

# Verificar Node.js
node --version  # Deve ser >= 18.0.0
npm --version   # Deve ser >= 9.0.0
```

## 📂 Preparação do Projeto

### 1. Navegar para o Projeto
```bash
# Navegar para o diretório do projeto
cd /caminho/para/DesafioTecnico

# Verificar estrutura
ls -la src/
```

### 2. Verificar Configurações
```bash
# Backend - verificar appsettings.json
cat src/Api/appsettings.json

# Frontend - verificar .env
cat src/Web/.env
```

## 🚀 Execução Passo a Passo

### Passo 1: Configurar Backend
```bash
# Navegar para API
cd src/Api

# Restaurar dependências
dotnet restore

# Compilar projeto
dotnet build

# Verificar se compila sem erros
echo "✅ Backend compilado com sucesso"
```

### Passo 2: Criar Migração
```bash
# Ainda no diretório src/Api
pwd  # Deve mostrar: /caminho/para/projeto/src/Api

# Listar migrações existentes
dotnet ef migrations list

# Criar nova migração
dotnet ef migrations add AddMedicoEntity

# Verificar se foi criada
ls -la Migrations/*AddMedicoEntity*
```

### Passo 3: Aplicar Migração
```bash
# Aplicar ao banco de dados
dotnet ef database update

# Verificar se foi aplicada
dotnet ef migrations list
# Deve mostrar AddMedicoEntity como aplicada
```

### Passo 4: Testar API
```bash
# Executar API
dotnet run &

# Aguardar inicialização (5-10 segundos)
sleep 10

# Testar health check
curl http://localhost:5000/health

# Testar endpoint de médicos
curl http://localhost:5000/api/medicos

# Deve retornar JSON com lista vazia:
# {"data":[],"totalCount":0,"page":1,"pageSize":7,"totalPages":0}
```

### Passo 5: Configurar Frontend
```bash
# Abrir novo terminal
# Navegar para Web
cd src/Web

# Instalar dependências
npm install

# Verificar variáveis de ambiente
cat .env
# Deve conter: VITE_API_URL=http://localhost:5000

# Se não existir, criar
echo "VITE_API_URL=http://localhost:5000" > .env
```

### Passo 6: Executar Frontend
```bash
# Ainda no diretório src/Web
npm run dev

# Deve mostrar:
# Local:   http://localhost:5173/
# Network: use --host to expose
```

### Passo 7: Validação Inicial
```bash
# Abrir navegador
open http://localhost:5173

# Fazer login como admin
# Navegar para "Médicos"
# Verificar se página carrega sem erros
```

## 🧪 Testes Automatizados

### Script de Teste Rápido
```bash
#!/bin/bash
# Salvar como: test-medicos.sh

echo "🧪 Testando API de Médicos..."

# Teste 1: Health Check
echo "1. Testando Health Check..."
response=$(curl -s http://localhost:5000/health)
if [[ $response == *"Healthy"* ]]; then
    echo "✅ Health Check OK"
else
    echo "❌ Health Check FALHOU"
    exit 1
fi

# Teste 2: Listar Médicos
echo "2. Testando GET /api/medicos..."
response=$(curl -s http://localhost:5000/api/medicos)
if [[ $response == *"data"* ]]; then
    echo "✅ GET /api/medicos OK"
else
    echo "❌ GET /api/medicos FALHOU"
    exit 1
fi

# Teste 3: Criar Médico
echo "3. Testando POST /api/medicos..."
response=$(curl -s -X POST "http://localhost:5000/api/medicos" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Dr. Teste macOS",
    "documento": "12345678901",
    "crm": "CRMTEST123",
    "especialidade": "Teste",
    "username": "dr.teste",
    "senha": "123456"
  }')

if [[ $response == *"id"* ]]; then
    echo "✅ POST /api/medicos OK"
    # Extrair ID para próximos testes
    medico_id=$(echo $response | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "📝 Médico criado com ID: $medico_id"
else
    echo "❌ POST /api/medicos FALHOU"
    echo "Resposta: $response"
    exit 1
fi

# Teste 4: Buscar por ID
if [ ! -z "$medico_id" ]; then
    echo "4. Testando GET /api/medicos/$medico_id..."
    response=$(curl -s "http://localhost:5000/api/medicos/$medico_id")
    if [[ $response == *"Dr. Teste macOS"* ]]; then
        echo "✅ GET /api/medicos/$medico_id OK"
    else
        echo "❌ GET /api/medicos/$medico_id FALHOU"
    fi
    
    # Teste 5: Excluir
    echo "5. Testando DELETE /api/medicos/$medico_id..."
    status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:5000/api/medicos/$medico_id")
    if [ "$status" = "204" ]; then
        echo "✅ DELETE /api/medicos/$medico_id OK"
    else
        echo "❌ DELETE /api/medicos/$medico_id FALHOU (Status: $status)"
    fi
fi

echo "🎉 Todos os testes concluídos!"
```

### Executar Testes
```bash
# Dar permissão de execução
chmod +x test-medicos.sh

# Executar
./test-medicos.sh
```

## 🔍 Verificações Específicas do macOS

### Permissões de Arquivo
```bash
# Verificar permissões do banco
ls -la mobilemed.db

# Se necessário, ajustar permissões
chmod 644 mobilemed.db
```

### Firewall e Segurança
```bash
# Verificar se portas estão abertas
lsof -i :5000  # API
lsof -i :5173  # Frontend

# Se bloqueado pelo firewall
# Ir em: System Preferences > Security & Privacy > Firewall
# Adicionar exceções para dotnet e node
```

### Problemas Comuns no macOS

#### Erro de Certificado SSL
```bash
# Se houver problemas com HTTPS
export ASPNETCORE_ENVIRONMENT=Development
dotnet dev-certs https --trust
```

#### Erro de Permissão SQLite
```bash
# Se banco não pode ser criado/acessado
sudo chown $(whoami) .
sudo chmod 755 .
```

#### Porta em Uso
```bash
# Verificar o que está usando a porta
lsof -i :5000

# Matar processo se necessário
kill -9 <PID>
```

## 📊 Monitoramento

### Logs em Tempo Real
```bash
# Terminal 1: Logs da API
cd src/Api
dotnet run | tee api.log

# Terminal 2: Logs do Frontend
cd src/Web
npm run dev | tee frontend.log

# Terminal 3: Monitorar requisições
tail -f api.log | grep -i "medicos"
```

### Activity Monitor
```bash
# Verificar uso de recursos
top -pid $(pgrep dotnet)
top -pid $(pgrep node)
```

## ✅ Checklist Final

Após completar todos os passos:

- [ ] .NET SDK 8.0+ instalado e funcionando
- [ ] Entity Framework Tools instalado
- [ ] Node.js 18+ instalado
- [ ] Repositório atualizado
- [ ] Migração `AddMedicoEntity` criada
- [ ] Migração aplicada ao banco
- [ ] API rodando em http://localhost:5000
- [ ] Frontend rodando em http://localhost:5173
- [ ] Health check respondendo
- [ ] Endpoint `/api/medicos` funcionando
- [ ] Página de médicos carregando
- [ ] Testes automatizados passando

## 🔄 Próximos Passos

1. **Executar validação completa:** `tasks/upgradeAPI/VALIDATION_CHECKLIST.md`
2. **Testar todos os endpoints:** `tasks/upgradeAPI/API_ENDPOINTS.md`
3. **Validar integração frontend-backend**
4. **Documentar resultados**
5. **Fazer commit das alterações**

## 📞 Suporte

Em caso de problemas:
1. Consultar `TROUBLESHOOTING.md`
2. Verificar logs detalhados
3. Testar em ambiente limpo
4. Documentar erro específico

---

**Desenvolvido para macOS Catalina 10.15+**  
**Testado com .NET 8.0 e Node.js 18+**