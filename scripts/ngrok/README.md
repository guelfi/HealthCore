# 🌐 Configuração ngrok - MobileMed

## 📋 Visão Geral

Esta pasta contém todos os scripts e configurações relacionadas ao ngrok para o projeto MobileMed. A solução foi desenvolvida para contornar a **limitação da conta gratuita do ngrok** que permite apenas 1 túnel simultâneo.

## 🚨 Problema Identificado

### Limitação da Conta Gratuita
- **Problema**: ngrok gratuito permite apenas 1 túnel simultâneo
- **Necessidade**: Frontend precisa acessar API em tempo real
- **Desafio**: Como expor o frontend externamente mantendo comunicação com a API?

## 🚀 Solução para Limitação de Túneis

Esta pasta contém uma solução completa para contornar a limitação de túneis da conta gratuita do ngrok. A estratégia é:

1. **Expor apenas o Frontend via ngrok**
2. **API roda localmente** (localhost:5000)
3. **Frontend acessa API via proxy** (configurado no Vite)
4. **Hosts dinâmicos permitidos** (qualquer URL do ngrok)
5. **Resultado:** Acesso externo completo com comunicação em tempo real

### 🔧 Configuração Dinâmica de Hosts

O `vite.config.ts` foi configurado para aceitar automaticamente qualquer host do ngrok:
- `.ngrok-free.app`
- `.ngrok.io` 
- `.ngrok.app`

Isso elimina a necessidade de alterar manualmente a configuração a cada nova URL do ngrok.

### Solução Implementada

**Arquitetura de Túnel Único com Proxy Interno**:
1. **Frontend** exposto via ngrok (acesso externo)
2. **API** roda localmente (acesso interno)
3. **Comunicação** mantida via localhost dentro do servidor

```
[Internet] → [ngrok] → [Frontend:5005] → [localhost] → [API:5000]
```

## 📁 Arquivos Disponíveis

### Scripts Principais

| Script | Descrição | Uso |
|--------|-----------|-----|
| `setup-single-tunnel.sh` | **⭐ PRINCIPAL** - Configura túnel único | Solução recomendada |
| `configure-frontend-env.sh` | Configura ambiente do frontend | Preparação |
| `test-single-tunnel.sh` | Testa a configuração | Verificação |

### Scripts Legados (Múltiplos Túneis)

| Script | Descrição | Limitação |
|--------|-----------|----------|
| `setup-ngrok-dual.sh` | Configuração dual (API + Frontend) | ❌ Requer conta paga |
| `start-ngrok-dual-tunnels.sh` | Inicia múltiplos túneis | ❌ Requer conta paga |
| `start-ngrok-complete.sh` | Configuração completa | ❌ Requer conta paga |

### Scripts Utilitários

| Script | Descrição |
|--------|-----------|
| `ngrok-simple.sh` | Configuração simples (1 serviço) |
| `start-ngrok.sh` | Script básico de inicialização |
| `test-ngrok.sh` | Teste básico do ngrok |

### Arquivos de Log

| Arquivo | Conteúdo |
|---------|----------|
| `ngrok-api.log` | Logs do túnel da API |
| `ngrok-frontend.log` | Logs do túnel do frontend |
| `current-session.txt` | Informações da sessão ativa |

## 🚀 Guia de Uso Rápido

### 1. Configuração Inicial

```bash
# Configurar ambiente do frontend
bash scripts/ngrok/configure-frontend-env.sh
```

### 2. Iniciar Serviços

```bash
# Iniciar tudo automaticamente
bash scripts/ngrok/setup-single-tunnel.sh
```

### 3. Testar Configuração

```bash
# Verificar se tudo está funcionando
bash scripts/ngrok/test-single-tunnel.sh
```

## 🔧 Configuração Detalhada

### Pré-requisitos

1. **ngrok instalado e configurado**:
   ```bash
   # Instalar ngrok
   sudo snap install ngrok
   
   # Configurar token (obtenha em https://ngrok.com)
   ngrok config add-authtoken YOUR_TOKEN
   ```

2. **Serviços do MobileMed**:
   - API rodando na porta 5000
   - Frontend rodando na porta 5005

### Configuração Automática

O script `configure-frontend-env.sh` configura automaticamente:

#### `.env.local` (Frontend)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
VITE_HOST=0.0.0.0
VITE_PORT=5005
```

#### `vite.config.ts` (Proxy)
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5005,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

## 📊 Como Funciona

### Fluxo de Comunicação

1. **Usuário externo** acessa URL do ngrok
2. **ngrok** redireciona para `localhost:5005` (Frontend)
3. **Frontend** faz requisições para `localhost:5000` (API)
4. **API** responde diretamente ao Frontend
5. **Frontend** retorna dados ao usuário

### Vantagens da Solução

✅ **Funciona com conta gratuita** (1 túnel apenas)  
✅ **Mantém todas as funcionalidades**  
✅ **Comunicação em tempo real**  
✅ **Fácil de configurar**  
✅ **Não requer mudanças no código**  

### Limitações

⚠️ **API não acessível externamente** (apenas via Frontend)  
⚠️ **Testes diretos da API** requerem acesso local  

## 🛠️ Solução de Problemas

### Erro: ERR_NGROK_8012

**Causa**: Serviço não está rodando na porta especificada

**Solução**:
```bash
# Verificar se os serviços estão rodando
curl http://localhost:5000/health  # API
curl http://localhost:5005         # Frontend

# Se não estiverem, iniciar:
bash scripts/ngrok/setup-single-tunnel.sh
```

### Frontend não carrega

**Verificações**:
1. Arquivo `.env.local` configurado corretamente
2. Frontend rodando na porta 5005
3. ngrok apontando para porta 5005

### API não responde

**Verificações**:
1. API rodando na porta 5000
2. Configuração `VITE_API_BASE_URL=http://localhost:5000`
3. Proxy configurado no `vite.config.ts`

### ngrok não inicia

**Soluções**:
```bash
# Verificar se ngrok está instalado
ngrok version

# Configurar token se necessário
ngrok config add-authtoken YOUR_TOKEN

# Parar processos existentes
pkill -f "ngrok http"
```

## 📱 Testando a Solução

### Teste Completo

```bash
# 1. Configurar ambiente
bash scripts/ngrok/configure-frontend-env.sh

# 2. Iniciar serviços
bash scripts/ngrok/setup-single-tunnel.sh

# 3. Testar configuração
bash scripts/ngrok/test-single-tunnel.sh

# 4. Acessar URL fornecida
# Exemplo: https://abc123.ngrok-free.app
```

### Verificações Manuais

1. **Acesso externo**: Abrir URL do ngrok no navegador
2. **Login**: Testar autenticação no sistema
3. **Dados**: Verificar se dados da API são carregados
4. **Tempo real**: Testar operações CRUD

## 🔄 Alternativas para Conta Paga

Se você possui conta paga do ngrok, pode usar os scripts legados:

```bash
# Múltiplos túneis (requer conta paga)
bash scripts/ngrok/setup-ngrok-dual.sh
bash scripts/ngrok/start-ngrok-dual-tunnels.sh
```

## 📞 Suporte

### Logs Úteis

```bash
# Logs da API
tail -f /tmp/mobilemed-api.log

# Logs do Frontend
tail -f /tmp/mobilemed-frontend.log

# Logs do ngrok
tail -f scripts/ngrok/ngrok-frontend.log

# Informações da sessão
cat scripts/ngrok/current-session.txt
```

### Comandos de Diagnóstico

```bash
# Verificar portas em uso
netstat -tlnp | grep -E ':(5000|5005|4040)'

# Verificar processos ngrok
ps aux | grep ngrok

# Testar conectividade
curl -I http://localhost:5000/health
curl -I http://localhost:5005
```

---

**💡 Dica**: Para desenvolvimento local, use `http://localhost:5005`. Para demonstrações externas, use a URL do ngrok fornecida pelo script.