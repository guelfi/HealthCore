# 🧪 Guia de Testes - HealthCore

## 🚀 **Início Rápido**

### **IP da Máquina Detectado**: `192.168.15.119`

### **1. Iniciar Ambos os Serviços**
```bash
./start-both.sh
```

### **2. Teste Rápido**
```bash
./quick-test.sh
```

### **3. URLs de Acesso**
- **Frontend**: http://192.168.15.119:5005
- **API**: http://192.168.15.119:5000
- **Swagger**: http://192.168.15.119:5000/swagger

## 📱 **Teste no Celular**

1. **Conecte o celular na mesma rede WiFi**
2. **Abra o navegador do celular**
3. **Acesse**: `http://192.168.15.119:5005`

## 🔧 **Scripts Disponíveis**

| Script | Descrição |
|--------|-----------|
| `./start-both.sh` | Inicia API + Frontend |
| `./start-api.sh` | Inicia apenas a API |
| `./start-frontend.sh` | Inicia apenas o Frontend |
| `./quick-test.sh` | Teste rápido de conectividade |
| `./test-connectivity.sh` | Teste completo de conectividade |

## 🏗️ **Build Manual**

### **API**
```bash
cd src/Api
dotnet clean
dotnet restore
dotnet build --configuration Release
dotnet run --urls="http://0.0.0.0:5000"
```

### **Frontend**
```bash
cd src/Web
npm install
npm run build
npm run dev -- --host 0.0.0.0 --port 5005
```

## 🌐 **Configuração de Rede**

### **Firewall (macOS)**
```bash
# Permitir conexões nas portas 5005 e 5000
sudo pfctl -f /etc/pf.conf
```

### **Verificar IP**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 🧪 **Cenários de Teste**

### **✅ Funcionalidades Básicas**
- [ ] Login de usuário
- [ ] Dashboard carrega
- [ ] Lista de pacientes
- [ ] Lista de exames
- [ ] Cadastro de paciente
- [ ] Cadastro de exame
- [ ] Responsividade mobile

### **✅ Conectividade**
- [ ] API responde (health check)
- [ ] CORS configurado
- [ ] Autenticação JWT
- [ ] Persistência SQLite
- [ ] Logs da aplicação

### **✅ Mobile**
- [ ] Interface responsiva
- [ ] Touch interactions
- [ ] Formulários mobile
- [ ] Orientação landscape/portrait

## 🚨 **Troubleshooting**

### **API não inicia**
```bash
# Verificar se a porta está em uso
lsof -i :5000

# Matar processo se necessário
kill -9 $(lsof -t -i:5000)
```

### **Frontend não carrega**
```bash
# Verificar se a porta está em uso
lsof -i :5005

# Limpar cache
cd src/Web && rm -rf node_modules/.cache dist
```

### **Celular não acessa**
1. Verificar se estão na mesma rede WiFi
2. Verificar firewall do macOS
3. Testar ping: `ping 192.168.15.119`
4. Verificar se os serviços estão rodando: `./quick-test.sh`

## 🔍 **Debug**

### **Logs da API**
- Console do terminal onde a API está rodando
- Logs salvos em `src/Api/logs/`

### **Logs do Frontend**
- Console do navegador (F12)
- Network tab para requisições HTTP

### **Diagnóstico de Rede**
- Acesse: http://192.168.15.119:5005/diagnostic
- Componente NetworkDiagnostic integrado

## 🌐 **Teste com ngrok (Opcional)**

### **Instalar ngrok**
```bash
brew install ngrok  # macOS
```

### **Usar ngrok**
```bash
# Terminal 1 - API
./start-api.sh

# Terminal 2 - Frontend  
./start-frontend.sh

# Terminal 3 - ngrok para Frontend
ngrok http 5005

# Usar a URL fornecida pelo ngrok
```

## 📊 **Métricas de Performance**

- **Tempo de carregamento**: < 3s
- **Tamanho do bundle**: 794KB (otimizar se necessário)
- **Latência da API**: < 500ms
- **Responsividade**: 60fps em mobile