# 🌐 Solução para Network Error via ngrok

## Problema Identificado

Quando você acessa o frontend via ngrok (`https://61c050673117.ngrok-free.app`), recebe "Network Error" porque:

1. **Mixed Content**: Frontend HTTPS (ngrok) → API HTTP (local) = Bloqueado pelo navegador
2. **Conta Gratuita**: ngrok gratuito permite apenas 1 túnel simultâneo
3. **Configuração**: Frontend precisa saber qual API usar quando acessado via ngrok

## ✅ Solução Implementada

### 1. Detecção Automática
O frontend detecta automaticamente quando está sendo acessado via ngrok e ajusta a configuração da API.

### 2. Configuração Dinâmica
- **Acesso Local**: Usa `http://192.168.15.119:5000`
- **Acesso ngrok**: Usa `VITE_NGROK_API_URL` do `.env.local`

### 3. Scripts Automatizados
Criamos scripts que facilitam o uso do ngrok:

## 🚀 Como Usar

### Opção 1: Script Automático (Recomendado)
```bash
# Configura tudo automaticamente
./start-ngrok-complete.sh
```

Este script:
1. Inicia ngrok para API
2. Configura o .env.local
3. Alterna para ngrok do frontend
4. Fornece as URLs finais

### Opção 2: Manual

#### Passo 1: Iniciar API e Frontend
```bash
./start-both.sh
```

#### Passo 2: Configurar ngrok para API
```bash
# Terminal 1: ngrok para API
ngrok http 5000
```

Copie a URL HTTPS (ex: `https://abc123.ngrok-free.app`)

#### Passo 3: Configurar .env.local
```bash
# Editar src/Web/.env.local
VITE_NGROK_API_URL=https://abc123.ngrok-free.app
```

#### Passo 4: Iniciar ngrok para Frontend
```bash
# Terminal 2: ngrok para frontend
ngrok http 5005
```

## 📱 URLs Finais

Após executar `./start-ngrok-complete.sh`:

- **API Local**: `http://192.168.15.119:5000`
- **API ngrok**: `https://[gerado].ngrok-free.app` (configurado automaticamente)
- **Frontend Local**: `http://192.168.15.119:5005`
- **Frontend ngrok**: `https://[gerado].ngrok-free.app` (use esta no celular)

## 🔧 Como Funciona

### 1. Detecção de Ambiente
```typescript
// src/Web/src/infrastructure/utils/apiConfig.ts
const isNgrok = currentHost.includes('.ngrok-free.app');

if (isNgrok) {
  // Usa VITE_NGROK_API_URL do .env.local
  return import.meta.env.VITE_NGROK_API_URL;
} else {
  // Usa IP local
  return 'http://192.168.15.119:5000';
}
```

### 2. CORS Configurado
A API já aceita conexões do ngrok:
```csharp
// src/Api/Program.cs
policy.SetIsOriginAllowed(origin => {
  // Permite ngrok URLs
  if (origin.Contains(".ngrok-free.app")) return true;
  // ... outras regras
});
```

### 3. Diagnóstico Automático
O componente `NetworkDiagnostic` detecta problemas e mostra soluções.

## 🐛 Troubleshooting

### Problema: "Network Error" ainda aparece
**Solução**: 
1. Execute `./start-ngrok-complete.sh`
2. Use a URL do frontend ngrok fornecida pelo script
3. Verifique se `VITE_NGROK_API_URL` está configurado no `.env.local`

### Problema: ngrok mostra página de aviso
**Solução**: 
- Clique em "Visit Site" na primeira vez
- Ou adicione header: `ngrok-skip-browser-warning: true`

### Problema: API não responde via ngrok
**Solução**:
1. Verifique se a API está rodando: `curl http://192.168.15.119:5000/health`
2. Reinicie o ngrok da API: `ngrok http 5000`
3. Atualize `VITE_NGROK_API_URL` no `.env.local`

### Problema: Só funciona localmente
**Solução**:
- Para acesso externo (celular), SEMPRE use as URLs ngrok
- Para acesso na mesma rede, use `http://192.168.15.119:5005`

## 📋 Comandos Úteis

```bash
# Ver status dos serviços
./quick-test.sh

# Testar conectividade completa
./test-connectivity.sh

# Parar todos os ngrok
pkill -f "ngrok http"

# Ver logs do ngrok
tail -f ngrok-frontend.log

# Verificar túneis ativos
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool
```

## 🎯 Resultado Final

Após seguir esta solução:

✅ **Frontend via ngrok** → **API via ngrok** (HTTPS → HTTPS) ✅  
✅ **Frontend local** → **API local** (HTTP → HTTP) ✅  
✅ **Detecção automática** do ambiente  
✅ **Configuração dinâmica** da API  
✅ **Diagnóstico automático** de problemas  

**Acesse no celular**: Use a URL do frontend ngrok fornecida pelo script `./start-ngrok-complete.sh`