# 🌐 Configuração ngrok - MobileMed

## 🚀 **Passo a Passo Completo**

### **1. Iniciar os Serviços Locais**
```bash
# Terminal 1 - Iniciar ambos os serviços
./start-both.sh
```

Aguarde até ver:
- ✅ API rodando em: `http://192.168.15.119:5000`
- ✅ Frontend rodando em: `http://192.168.15.119:5005`

### **2. Iniciar ngrok para API**
```bash
# Terminal 2 - ngrok para API
ngrok http 5000
```

**Copie a URL HTTPS** que aparece (ex: `https://abc123.ngrok-free.app`)

### **3. Configurar Frontend para usar ngrok da API**
```bash
# Editar arquivo de configuração
nano src/Web/.env.local
```

**Adicione/atualize:**
```env
VITE_API_URL=http://192.168.15.119:5000
VITE_API_BASE_URL=http://192.168.15.119:5000
VITE_NGROK_API_URL=https://SUA_URL_NGROK_DA_API.ngrok-free.app
VITE_APP_TITLE=MobileMed
VITE_API_TIMEOUT=30000
```

### **4. Reiniciar Frontend**
```bash
# Parar o frontend (Ctrl+C no terminal do start-both.sh)
# Depois reiniciar:
cd src/Web && npm run dev -- --host 0.0.0.0 --port 5005
```

### **5. Iniciar ngrok para Frontend**
```bash
# Terminal 3 - ngrok para Frontend
ngrok http 5005
```

**Copie a URL HTTPS** do frontend (ex: `https://def456.ngrok-free.app`)

## 📱 **Testar no Celular**

1. **Abra o navegador do celular**
2. **Acesse a URL do ngrok do Frontend**: `https://def456.ngrok-free.app`
3. **O frontend deve carregar e conseguir acessar a API**

## 🔍 **Verificar se está Funcionando**

### **No navegador do celular:**
1. Abra as **Ferramentas de Desenvolvedor** (se possível)
2. Vá para a aba **Console**
3. Deve aparecer logs como:
   ```
   🔍 Detectando configuração da API: {...}
   🌐 Detectado acesso via ngrok
   ✅ Usando URL ngrok da API do .env: https://abc123.ngrok-free.app
   ```

### **Teste a API diretamente:**
- Acesse: `https://SUA_URL_NGROK_DA_API.ngrok-free.app/health`
- Deve retornar: `{"status":"Healthy"}`

## 🚨 **Troubleshooting**

### **"Network Error" no celular via ngrok:**

1. **Verificar se a API ngrok está funcionando:**
   ```bash
   curl https://SUA_URL_NGROK_DA_API.ngrok-free.app/health
   ```

2. **Verificar se o .env.local está correto:**
   ```bash
   cat src/Web/.env.local
   ```

3. **Verificar logs do navegador:**
   - Abrir DevTools no celular
   - Verificar mensagens de erro na aba Console

4. **Reiniciar frontend após alterar .env.local:**
   ```bash
   # Parar frontend (Ctrl+C)
   cd src/Web && npm run dev -- --host 0.0.0.0 --port 5005
   ```

### **ngrok "Visit Site" warning:**
- Clique em "Visit Site" quando aparecer a tela de aviso do ngrok
- Ou adicione `--domain` se tiver conta paga do ngrok

### **CORS Error:**
- A API já está configurada para aceitar ngrok
- Se persistir, verifique se a URL no .env.local está correta

## 🔧 **Script Automático (Experimental)**
```bash
./start-ngrok.sh
```

## 📋 **Resumo das URLs**

| Serviço | Local | ngrok |
|---------|-------|-------|
| **API** | `http://192.168.15.119:5000` | `https://abc123.ngrok-free.app` |
| **Frontend** | `http://192.168.15.119:5005` | `https://def456.ngrok-free.app` |

## 💡 **Dicas**

1. **Sempre use HTTPS** das URLs do ngrok
2. **Configure VITE_NGROK_API_URL** antes de iniciar o frontend
3. **Teste a API ngrok** diretamente antes de testar o frontend
4. **Reinicie o frontend** após alterar variáveis de ambiente
5. **Use o dashboard do ngrok** (`http://localhost:4040`) para monitorar requisições