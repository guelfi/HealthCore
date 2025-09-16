# 🌐 Guia de Desenvolvimento Distribuído - HealthCore

## 📋 Cenário de Desenvolvimento

### 🖥️ **Máquina 1** (Sua - Desenvolvimento Frontend)
- **SO**: Windows (sem .NET Core compatível)
- **Responsabilidade**: Desenvolvimento da integração Frontend
- **Tecnologias**: React + Vite + TypeScript

### 🖥️ **Máquina 2** (Outro Desenvolvedor - Backend)
- **SO**: macOS Catalina 10.15.7
- **Responsabilidade**: API e correções backend
- **Tecnologias**: .NET Core 8 + SQLite + JWT
- **Status**: .NET Core 8 funcionando perfeitamente

---

## 🚀 Configuração Passo a Passo

### **Máquina 2 (Backend) - Configuração do Outro Desenvolvedor**

#### 1. **Preparar a API para Acesso Externo**

```bash
# 1. Clonar o repositório
git clone [URL_DO_REPOSITORIO]
cd HealthCore

# 2. Verificar configuração de rede
cd scripts
./api.sh start

# 3. Anotar o IP mostrado no terminal
# Exemplo: IP Local: 192.168.1.100
```

#### 2. **Verificar CORS (Já Configurado)**
A API já aceita conexões externas nas seguintes origens:
- `http://localhost:5005` 
- `http://127.0.0.1:5005`
- `http://0.0.0.0:5005`
- `http://192.168.15.119:5005`

#### 3. **Liberar Firewall (macOS Catalina 10.15.7)**
```bash
# Verificar status do firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Se o firewall estiver ativo, adicionar exceção para a porta 5000
# Método 1: Através das Preferências do Sistema
# System Preferences > Security & Privacy > Firewall > Firewall Options
# Adicionar exceção para dotnet ou para a porta 5000

# Método 2: Via linha de comando (requer cuidado)
# sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/share/dotnet/dotnet
# sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/share/dotnet/dotnet

# Verificar se a porta está aberta
lsof -i :5000
```

**Nota para macOS Catalina**: O sistema pode solicitar permissões adicionais devido às proteções de segurança. Aceite as solicitações quando aparecerem.

### **Máquina 1 (Frontend) - Sua Configuração**

#### 1. **Configurar URL da API Externa**

Edite o arquivo `src/Web/.env`:

```env
# API Configuration
# Substitua pelo IP real da máquina 2
VITE_API_BASE_URL=http://192.168.1.100:5000

# Application Configuration
VITE_APP_NAME=HealthCore Frontend
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

#### 2. **Executar o Frontend**

```bash
cd src/Web
npm install
npm run dev

# O frontend estará disponível em:
# http://localhost:5005
# http://SEU_IP:5005
```

---

## 🔗 URLs de Acesso

### **Frontend (Sua Máquina)**
- **Local**: `http://localhost:5005`
- **Rede**: `http://SEU_IP:5005`

### **Backend (Máquina 2)**
- **API**: `http://IP_MAQUINA_2:5000`
- **Swagger**: `http://IP_MAQUINA_2:5000/swagger`

### **Fluxo de Dados**
```
[Sua Máquina]                    [Máquina 2]
Frontend:5005  ──HTTP──>  API:5000
     ↑                           ↓
Browser ←─────────────────── Database
```

---

## 🛠️ Comandos Úteis

### **Scripts de Teste de Conectividade**

**Windows (PowerShell) - Teste Completo:**
```powershell
# Executar script PowerShell
.\scripts\test-connectivity.ps1

# Ou com IP específico
.\scripts\test-connectivity.ps1 192.168.1.100
```

**Windows (Batch) - Teste Simples:**
```cmd
# Executar script batch
scripts\test-connectivity.bat

# Ou com IP específico
scripts\test-connectivity.bat 192.168.1.100
```

**Linux/Mac/Unix:**
```bash
# Executar script bash
./scripts/test-connectivity.sh

# Ou com IP específico
./scripts/test-connectivity.sh 192.168.1.100
```

### **Descobrir IP da Máquina**

**macOS Catalina 10.15.7:**
```bash
# Método preferido para Catalina
ifconfig | grep "inet " | grep -v 127.0.0.1

# Ou mais específico
ifconfig en0 | grep "inet " | grep -v 127.0.0.1

# Se en0 não funcionar, tentar en1
ifconfig en1 | grep "inet " | grep -v 127.0.0.1

# Listar todas as interfaces
ifconfig | grep -A 1 "flags=" | grep "inet "
```

**Linux/Unix:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# ou
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig | findstr "IPv4"
```

### **Testar Conectividade**

**Da sua máquina para a API:**

**Windows (PowerShell):**
```powershell
# Teste completo
.\scripts\test-connectivity.ps1 IP_MAQUINA_2

# Ou manualmente
Test-NetConnection IP_MAQUINA_2 -Port 5000
Invoke-WebRequest http://IP_MAQUINA_2:5000/swagger
```

**Windows (Batch/CMD):**
```cmd
# Teste simples
scripts\test-connectivity.bat IP_MAQUINA_2

# Ou manualmente
ping IP_MAQUINA_2
telnet IP_MAQUINA_2 5000
```

**Linux/Mac/Unix:**
```bash
# Teste completo
./scripts/test-connectivity.sh IP_MAQUINA_2

# Ou manualmente
curl http://IP_MAQUINA_2:5000/swagger
nc -z IP_MAQUINA_2 5000
```

### **Monitorar Logs**

**Máquina 2 (Backend):**
```bash
# Ver logs em tempo real
tail -f ../log/api.log

# Status da API
./scripts/api.sh status
```

---

## ⚠️ Problemas Conhecidos e Soluções

### **macOS Catalina 10.15.7 - Problemas Específicos**

#### **Problema 1: .NET Core 8 Incompatibilidade**
```bash
# Sintoma: Erro ao executar dotnet
# Solução: Verificar compatibilidade
dotnet --version

# Se não funcionar, considerar .NET 6 LTS
# Download: https://dotnet.microsoft.com/download/dotnet/6.0
```

#### **Problema 2: Permissões de Segurança**
```bash
# Sintoma: macOS bloqueia execução
# Solução: Aceitar permissões quando solicitadas
# Ou temporariamente:
sudo spctl --master-disable  # CUIDADO: Desabilita Gatekeeper
# Lembrar de reabilitar depois:
# sudo spctl --master-enable
```

#### **Problema 3: Firewall Restritivo**
```bash
# Sintoma: Conexão recusada da máquina Windows
# Solução: Verificar e configurar firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Se ativo, adicionar exceção via System Preferences
# Security & Privacy > Firewall > Firewall Options
```

#### **Problema 4: Comandos de Rede Antigos**
```bash
# No Catalina, alguns comandos podem ter comportamento diferente
# Use ifconfig em vez de ip addr
ifconfig en0 | grep "inet "

# Para testar conectividade
ping -c 1 IP_DA_MAQUINA_WINDOWS
telnet IP_DA_MAQUINA_WINDOWS 5005
```

## 🔧 Resolução de Problemas

### **Problema: CORS Error**
```javascript
// Se aparecer erro de CORS, verificar:
// 1. Se o IP da sua máquina está nas origens permitidas
// 2. Adicionar novo IP no Program.cs se necessário
```

### **Problema: Conexão Recusada**
```bash
# Verificar se:
# 1. API está rodando na máquina 2
# 2. Firewall permite conexões na porta 5000
# 3. IP está correto no arquivo .env
```

### **Problema: Timeout de Requisição**
```javascript
// No client.ts, aumentar timeout se necessário:
timeout: 30000, // 30 segundos
```

---

## 📊 Endpoints Disponíveis

### **Autenticação**
- `POST /login` - Login do usuário
- `POST /logout` - Logout do usuário

### **Pacientes**
- `GET /pacientes` - Listar pacientes
- `POST /pacientes` - Criar paciente
- `GET /pacientes/{id}` - Buscar paciente
- `PUT /pacientes/{id}` - Atualizar paciente
- `DELETE /pacientes/{id}` - Deletar paciente

### **Exames**
- `GET /exames` - Listar exames
- `POST /exames` - Criar exame
- `GET /exames/{id}` - Buscar exame
- `PUT /exames/{id}` - Atualizar exame
- `DELETE /exames/{id}` - Deletar exame

---

## 🤝 Fluxo de Trabalho Colaborativo

### **Sua Responsabilidade (Frontend)**
1. ✅ Desenvolver componentes React
2. ✅ Implementar integração com API
3. ✅ Testes de interface
4. ✅ Validações frontend
5. ✅ UX/UI responsivo

### **Responsabilidade do Outro Dev (Backend)**
1. ✅ Manter API funcionando
2. ✅ Corrigir bugs reportados
3. ✅ Implementar novos endpoints
4. ✅ Logs e monitoramento
5. ✅ Testes unitários

### **Comunicação**
- **Issues reportados**: Via logs ou mensagens
- **Novos endpoints**: Documentar no Swagger
- **Mudanças na API**: Comunicar alterações breaking

---

## ✅ Checklist de Configuração

### **Máquina 2 (Backend)**
- [ ] ✅ .NET Core 8 instalado
- [ ] ✅ Repositório clonado
- [ ] ✅ API rodando (`./scripts/api.sh start`)
- [ ] ✅ Swagger acessível externamente
- [ ] ✅ Firewall configurado
- [ ] ✅ IP compartilhado com frontend

### **Máquina 1 (Frontend)**
- [ ] ✅ Node.js instalado
- [ ] ✅ Repositório clonado
- [ ] ✅ Dependências instaladas (`npm install`)
- [ ] ✅ Arquivo `.env` configurado com IP correto
- [ ] ✅ Frontend rodando (`npm run dev`)
- [ ] ✅ Conectividade com API testada

---

**🎯 Resultado Esperado**: Frontend consumindo API da outra máquina com sucesso, permitindo desenvolvimento paralelo e eficiente!