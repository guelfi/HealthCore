# 🚀 Guia de Scripts MobileMed

## Scripts Disponíveis

### 🏥 Serviços Individuais

#### API (Backend)
```bash
# Iniciar API
./scripts/.api.sh

# Parar API  
./scripts/stop-api.sh
```

#### Frontend (Web)
```bash
# Iniciar Frontend
./scripts/front.sh

# Parar Frontend
./scripts/stop-front.sh
```

### 🌐 Plataforma Completa

#### Iniciar Ambos os Serviços
```bash
./scripts/servers.sh
```

#### Parar Todos os Serviços
```bash
./scripts/stop-all.sh
```

## 📊 Informações dos Serviços

### Portas Configuradas
- **API**: 5000
- **Frontend**: 5005

### URLs de Acesso
- **Frontend Local**: http://localhost:5005
- **Frontend Rede**: http://192.168.15.119:5005
- **API Local**: http://localhost:5000
- **API Rede**: http://192.168.15.119:5000
- **Swagger**: http://localhost:5000/swagger

## 📁 Estrutura de Logs

Os logs são salvos em:
```
log/
├── api.log          # Logs da API
├── frontend.log     # Logs do Frontend
├── api.pid          # PID da API
└── frontend.pid     # PID do Frontend
```

## 🔧 Comandos Úteis

### Monitorar Logs em Tempo Real
```bash
# Todos os logs
tail -f log/*.log

# Apenas API
tail -f log/api.log

# Apenas Frontend
tail -f log/frontend.log
```

### Verificar Processos
```bash
# Verificar portas em uso
lsof -i :5000  # API
lsof -i :5005  # Frontend

# Verificar processos por PID
ps -p $(cat log/api.pid)
ps -p $(cat log/frontend.pid)
```

### Limpar Logs
```bash
# Limpar todos os logs
rm -f log/*.log

# Limpar PIDs (se os processos não estiverem rodando)
rm -f log/*.pid
```

## 🎨 Características dos Scripts

### ✨ Apresentação Elegante
- Interface colorida e moderna
- Iconografia intuitiva
- Informações organizadas em boxes
- Feedback visual claro

### 🔄 Execução em Segundo Plano
- Todos os serviços rodam em background
- Terminal fica livre após inicialização
- PIDs salvos para controle posterior

### 🌐 Configuração de Rede
- Acesso liberado para 0.0.0.0
- Detecção automática do IP local
- URLs de acesso exibidas claramente

### 🛡️ Gerenciamento Robusto
- Verificação de processos existentes
- Limpeza automática de PIDs órfãos
- Tratamento de erros elegante
- Logs detalhados para debugging

## 🚨 Solução de Problemas

### Porta em Uso
Se uma porta estiver em uso, os scripts automaticamente:
1. Tentam parar o processo existente
2. Forçam a parada se necessário
3. Limpam PIDs órfãos

### Falha na Inicialização
1. Verifique os logs: `cat log/api.log` ou `cat log/frontend.log`
2. Verifique se as dependências estão instaladas
3. Certifique-se de que as portas estão livres

### Permissões
Se necessário, torne os scripts executáveis:
```bash
chmod +x scripts/*.sh
```