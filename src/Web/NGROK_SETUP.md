# 🌐 Configuração Ngrok - MobileMed Frontend

Este guia ajuda a resolver problemas de "Network Error" ao acessar o MobileMed via ngrok.

## 🚨 Problema Comum: Network Error

Quando você acessa o frontend via ngrok (ex: `https://61c050673117.ngrok-free.app`) e recebe "Network Error", geralmente é um problema de configuração de CORS ou conectividade com a API.

## ✅ Solução Passo a Passo

### 1. Verificar se a API está rodando

```bash
# No terminal, vá para a pasta da API
cd src/Api

# Inicie a API
dotnet run --urls http://0.0.0.0:5000

# A API deve estar acessível em:
# - http://localhost:5000
# - http://192.168.15.119:5000 (IP da sua máquina na rede)
```

### 2. Testar conectividade da API

```bash
# Teste se a API responde
curl http://192.168.15.119:5000/health/ready

# Deve retornar: {"status":"ready","timestamp":"..."}
```

### 3. Configurar o Frontend para Ngrok

```bash
# No terminal, vá para a pasta do frontend
cd src/Web

# Use o script de configuração automática
./scripts/start-with-ngrok.sh https://61c050673117.ngrok-free.app

# OU configure manualmente:
cp .env.ngrok .env
```

### 4. Iniciar o Ngrok

```bash
# Em um novo terminal
ngrok http 5005

# Copie a URL fornecida (ex: https://abc123.ngrok-free.app)
```

### 5. Atualizar configurações se necessário

Edite o arquivo `.env` com as configurações corretas:

```env
# URL da API (deve ser o IP da máquina na rede local)
VITE_API_BASE_URL=http://192.168.15.119:5000

# Outras configurações
VITE_API_TIMEOUT=30000
VITE_APP_NAME=MobileMed Frontend
VITE_DEV_MODE=true
```

## 🔧 Diagnóstico de Problemas

### Acesse a página de diagnóstico

Vá para: `https://sua-url-ngrok.ngrok-free.app/diagnostic`

Esta página mostra:

- ✅ Status da conectividade com a API
- ⚙️ Configurações atuais
- 🌐 Detecção automática de ngrok
- 📱 Informações do dispositivo

### Problemas Comuns e Soluções

#### 1. "Network Error" ou "CORS Error"

**Causa:** API não está configurada para aceitar requisições do ngrok
**Solução:** A API já está configurada para aceitar ngrok automaticamente

#### 2. "API não está respondendo"

**Causa:** API não está rodando ou não está acessível na rede
**Solução:**

```bash
# Verificar se a API está rodando
curl http://192.168.15.119:5000/health/ready

# Se não responder, reiniciar a API
cd src/Api
dotnet run --urls http://0.0.0.0:5000
```

#### 3. "Timeout" ou requisições lentas

**Causa:** Rede lenta ou configuração de timeout baixa
**Solução:** Aumentar timeout no `.env`:

```env
VITE_API_TIMEOUT=60000
```

#### 4. Problemas de autenticação

**Causa:** Token expirado ou problemas de localStorage
**Solução:** Limpar dados e fazer login novamente:

```javascript
// No console do navegador
localStorage.clear();
location.reload();
```

## 📱 Teste em Dispositivos Móveis

### 1. Configuração para Mobile

O tema já está otimizado para mobile com:

- ✅ Breakpoints responsivos
- ✅ Touch targets de 44px+
- ✅ Tipografia adaptativa
- ✅ Componentes responsivos

### 2. Teste de Responsividade

- **Desktop:** Funcionalidade completa
- **Tablet:** Layout adaptado com sidebar colapsável
- **Mobile:** Interface otimizada para touch

### 3. Verificar no DevTools

1. Abra DevTools (F12)
2. Clique no ícone de dispositivo móvel
3. Teste diferentes resoluções
4. Verifique se não há erros no console

## 🚀 Comandos Úteis

```bash
# Iniciar com configuração ngrok
./scripts/start-with-ngrok.sh

# Testar API
curl http://192.168.15.119:5000/health/ready

# Ver logs da API
cd src/Api && dotnet run --verbosity normal

# Limpar cache do npm
npm run dev -- --force

# Verificar configuração atual
cat .env
```

## 📞 Troubleshooting Avançado

### Verificar IP da máquina

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

### Testar CORS manualmente

```javascript
// No console do navegador
fetch('http://192.168.15.119:5000/health/ready')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Verificar logs do ngrok

O ngrok mostra todas as requisições. Verifique se:

- ✅ Requisições chegam ao ngrok
- ✅ Não há erros 4xx/5xx
- ✅ Tempo de resposta é aceitável

## 🎯 Checklist Final

Antes de reportar problemas, verifique:

- [ ] API está rodando em `http://192.168.15.119:5000`
- [ ] API responde em `/health/ready`
- [ ] Frontend está configurado com IP correto no `.env`
- [ ] Ngrok está apontando para porta 5005
- [ ] Não há erros no console do navegador
- [ ] Página de diagnóstico mostra tudo verde
- [ ] Testou em modo incógnito/privado

Se todos os itens estão ✅ e ainda há problemas, verifique os logs da API e do ngrok para mais detalhes.
