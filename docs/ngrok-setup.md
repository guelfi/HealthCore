# 🔗 Configuração do Ngrok - HealthCore

Guia completo para configurar e usar o ngrok com o projeto HealthCore, incluindo soluções para o erro **ERR_NGROK_8012**.

## 📋 Índice

- [Problema ERR_NGROK_8012](#problema-err_ngrok_8012)
- [Instalação do Ngrok](#instalação-do-ngrok)
- [Configuração Rápida](#configuração-rápida)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Solução de Problemas](#solução-de-problemas)
- [Configuração Avançada](#configuração-avançada)

## 🚨 Problema ERR_NGROK_8012

### O que significa?

O erro `ERR_NGROK_8012` indica que o ngrok conseguiu receber o tráfego, mas não conseguiu se conectar ao serviço web local. Isso geralmente acontece quando:

- O serviço não está rodando na porta especificada
- O serviço está configurado para aceitar apenas conexões locais
- Há problemas de firewall ou rede
- O IP/porta especificados estão incorretos

### Solução Rápida

```bash
# 1. Execute o diagnóstico automático
cd src/Web
npm run fix:ngrok

# 2. Ou execute manualmente:
./scripts/fix-ngrok-connection.sh
```

## 📦 Instalação do Ngrok

### Linux (Ubuntu/Debian)

```bash
# Método 1: Via snap (recomendado)
sudo snap install ngrok

# Método 2: Via apt
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### Windows

1. Baixe de: https://ngrok.com/download
2. Extraia o arquivo `ngrok.exe`
3. Adicione ao PATH do sistema

### macOS

```bash
# Via Homebrew
brew install ngrok/ngrok/ngrok

# Via download direto
# Baixe de: https://ngrok.com/download
```

### Configuração do Token

```bash
# Obtenha seu token em: https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## ⚡ Configuração Rápida

### 1. Iniciar Serviços

```bash
# Terminal 1: API
cd src/Api
dotnet run

# Terminal 2: Frontend
cd src/Web
npm run dev

# Terminal 3: Ngrok
cd src/Web
npm run ngrok:start
```

### 2. Configuração Automática

```bash
cd src/Web
npm run setup:ngrok
```

Este comando:
- Verifica se os serviços estão rodando
- Inicia os serviços se necessário
- Configura e inicia o ngrok
- Abre o painel de controle

## 🛠️ Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|----------|
| **Diagnóstico** | `npm run fix:ngrok` | Diagnostica e corrige problemas de conexão |
| **Configuração** | `npm run setup:ngrok` | Configuração completa e automática |
| **Iniciar Ngrok** | `npm run ngrok:start` | Inicia apenas o túnel ngrok |
| **Painel** | `npm run ngrok:dashboard` | Abre o painel de controle do ngrok |
| **Desenvolvimento** | `npm run dev:ngrok` | Inicia frontend com configuração ngrok |

## 🔧 Solução de Problemas

### Problema: "connection refused"

```bash
# Verificar se os serviços estão rodando
netstat -tuln | grep -E ':(5000|5005)'

# Testar conectividade
curl http://localhost:5005
curl http://localhost:5000/health/ready

# Se não estiverem rodando:
cd src/Api && dotnet run &
cd src/Web && npm run dev &
```

### Problema: "Invalid Host header"

Verifique se o Vite está configurado corretamente em `vite.config.ts`:

```typescript
server: {
  port: 5005,
  host: '0.0.0.0', // Permite acesso externo
  strictPort: true,
  hmr: {
    port: 5005,
    host: 'localhost',
  },
  allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app'],
}
```

### Problema: Ngrok não encontrado

```bash
# Verificar instalação
which ngrok
ngrok version

# Se não estiver instalado, siga as instruções de instalação acima
```

### Problema: Token não configurado

```bash
# Configurar token
ngrok config add-authtoken YOUR_TOKEN

# Verificar configuração
ngrok config check
```

## ⚙️ Configuração Avançada

### Arquivo de Configuração Ngrok

Crie `~/.ngrok2/ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE

tunnels:
  frontend:
    addr: 5005
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5005
    
  api:
    addr: 5000
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5000

  both:
    addr: 5005
    proto: http
    bind_tls: true
    inspect: true
    host_header: localhost:5005
    subdomain: healthcore-dev  # Requer conta paga
```

### Usar Configuração Personalizada

```bash
# Iniciar túnel específico
ngrok start frontend

# Iniciar múltiplos túneis
ngrok start frontend api

# Usar configuração customizada
ngrok start -config ~/.ngrok2/ngrok.yml frontend
```

### Variáveis de Ambiente

Crie `.env.ngrok` no diretório `src/Web`:

```env
# Configuração para Ngrok
VITE_NGROK_URL=https://your-ngrok-url.ngrok-free.app
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=HealthCore Frontend
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
```

## 📱 Uso em Produção

### Domínio Personalizado (Conta Paga)

```bash
# Com subdomínio personalizado
ngrok http 5005 --subdomain=healthcore

# Com domínio próprio
ngrok http 5005 --hostname=app.seudominio.com
```

### Autenticação Básica

```bash
# Adicionar autenticação
ngrok http 5005 --basic-auth="usuario:senha"
```

### Logs e Monitoramento

```bash
# Logs detalhados
ngrok http 5005 --log=stdout --log-level=debug

# Salvar logs em arquivo
ngrok http 5005 --log=/tmp/ngrok.log
```

## 🔍 Comandos de Diagnóstico

```bash
# Verificar status dos serviços
ps aux | grep -E '(dotnet|node|vite)'

# Verificar portas em uso
netstat -tuln | grep -E ':(5000|5005|4040)'

# Testar conectividade
curl -I http://localhost:5005
curl -I http://localhost:5000/health/ready

# Verificar configuração do ngrok
ngrok config check

# Ver túneis ativos
curl http://localhost:4040/api/tunnels
```

## 📞 Suporte

Se os problemas persistirem:

1. Execute o diagnóstico completo: `npm run fix:ngrok`
2. Verifique os logs em `/tmp/healthcore-*.log`
3. Consulte a documentação oficial: https://ngrok.com/docs
4. Verifique o painel do ngrok: http://localhost:4040

## 🎯 Dicas Importantes

- ✅ **Use sempre**: `ngrok http 5005` (não especifique IP)
- ✅ **Certifique-se**: Que o Vite está configurado com `host: '0.0.0.0'`
- ✅ **Verifique**: Se não há firewall bloqueando as portas
- ✅ **Configure**: O token de autenticação do ngrok
- ✅ **Monitore**: O painel do ngrok em http://localhost:4040

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0