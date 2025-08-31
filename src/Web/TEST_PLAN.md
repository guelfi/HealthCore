# 🧪 Plano de Testes de Conectividade - MobileMed

## 📋 **Cenários de Teste**

### **1. Teste Local com IP da Máquina (PREFERENCIAL)**
- **Objetivo**: Verificar funcionamento usando IP real da máquina
- **IP Detectado**: `192.168.15.119`
- **API**: `http://192.168.15.119:5000`
- **Frontend**: `http://192.168.15.119:5005`
- **Comandos**:
  ```bash
  # Terminal 1 - API (bind em todas interfaces)
  cd src/Api && dotnet run --urls="http://0.0.0.0:5000"

  # Terminal 2 - Frontend (bind em todas interfaces)
  cd src/Web && npm run dev -- --host 0.0.0.0 --port 5005
  ```

### **2. Teste Rede Interna (Dispositivos Móveis)**
- **Objetivo**: Testar acesso via celular na mesma rede WiFi
- **API**: `http://192.168.15.119:5000`
- **Frontend**: `http://192.168.15.119:5005`
- **Pré-requisitos**:
  - Notebook e celular na mesma rede WiFi
  - Firewall liberado para as portas 5005 e 5000
- **Comandos**: (mesmos do teste 1)

### **3. Teste Externo (ngrok)**
- **Objetivo**: Testar acesso via internet (notebook + celular)
- **API**: `https://[RANDOM].ngrok-free.app`
- **Frontend**: `https://[RANDOM].ngrok-free.app`
- **Comandos**:
  ```bash
  # Terminal 1 - API
  cd src/Api && dotnet run

  # Terminal 2 - Frontend
  cd src/Web && npm run dev

  # Terminal 3 - ngrok para API
  ngrok http 5000

  # Terminal 4 - ngrok para Frontend
  ngrok http 5005
  ```

## 🔍 **Checklist de Testes**

### **Funcionalidades Básicas**
- [ ] Login de usuário
- [ ] Dashboard carrega
- [ ] Lista de pacientes
- [ ] Lista de exames
- [ ] Cadastro de paciente
- [ ] Cadastro de exame
- [ ] Responsividade mobile

### **Conectividade**
- [ ] API responde (health check)
- [ ] CORS configurado
- [ ] Autenticação JWT
- [ ] Persistência SQLite
- [ ] Logs da aplicação

### **Performance**
- [ ] Tempo de carregamento < 3s
- [ ] Responsividade da UI
- [ ] Tamanho do bundle
- [ ] Latência da API

## 🚨 **Problemas Conhecidos**
1. Alguns warnings de TypeScript (não críticos)
2. Bundle grande (794KB) - considerar code splitting
3. Sass deprecation warnings (não críticos)

## 📱 **Teste Mobile**
- Testar em diferentes tamanhos de tela
- Verificar touch interactions
- Validar formulários mobile
- Testar orientação landscape/portrait

## 🔧 **Ferramentas de Debug**
- NetworkDiagnostic component (já implementado)
- Browser DevTools
- API logs via Serilog
- ngrok inspection interface