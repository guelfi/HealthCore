# 🔧 Configuração de Portas - HealthCore

## ✅ **Portas Definidas**

| Serviço | Porta | URL Completa |
|---------|-------|--------------|
| **API** | **5000** | `http://192.168.15.119:5000` |
| **Frontend** | **5005** | `http://192.168.15.119:5005` |

## 📋 **URLs de Acesso**

### **🖥️ Notebook**
- **Aplicação**: http://192.168.15.119:5005
- **API**: http://192.168.15.119:5000
- **Swagger**: http://192.168.15.119:5000/swagger
- **Health Check**: http://192.168.15.119:5000/health

### **📱 Celular (mesma rede WiFi)**
- **Aplicação**: http://192.168.15.119:5005
- **API**: http://192.168.15.119:5000

## 🚀 **Comandos para Iniciar**

### **Ambos os Serviços**
```bash
./start-both.sh
```

### **Apenas API (porta 5000)**
```bash
./start-api.sh
# ou manualmente:
cd src/Api && dotnet run --urls="http://0.0.0.0:5000"
```

### **Apenas Frontend (porta 5005)**
```bash
./start-frontend.sh
# ou manualmente:
cd src/Web && npm run dev -- --host 0.0.0.0 --port 5005
```

## 🔍 **Verificar se está Funcionando**
```bash
./quick-test.sh
```

## ⚙️ **Configurações dos Arquivos**

### **Vite (Frontend)**
- Arquivo: `src/Web/vite.config.ts`
- Porta: `5005`
- Host: `0.0.0.0` (permite acesso externo)

### **API (.NET)**
- Comando: `dotnet run --urls="http://0.0.0.0:5000"`
- Porta: `5000`
- Host: `0.0.0.0` (permite acesso externo)

### **Variáveis de Ambiente**
- Arquivo: `src/Web/.env.local`
- `VITE_API_URL=http://192.168.15.119:5000`

## 🌐 **Teste com ngrok**

### **Para API**
```bash
ngrok http 5000
```

### **Para Frontend**
```bash
ngrok http 5005
```

## 🔥 **Firewall (macOS)**
Certifique-se de que as portas estão liberadas:
```bash
# Verificar se as portas estão em uso
lsof -i :5000
lsof -i :5005

# Se necessário, matar processos
kill -9 $(lsof -t -i:5000)
kill -9 $(lsof -t -i:5005)
```

## ✅ **Checklist Final**
- [ ] API rodando na porta 5000
- [ ] Frontend rodando na porta 5005
- [ ] Ambos acessíveis via IP da máquina (192.168.15.119)
- [ ] CORS configurado para aceitar requisições do frontend
- [ ] Celular consegue acessar na mesma rede WiFi