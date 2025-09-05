# 🏥 MobileMed - Gerenciador de Serviços

Scripts unificados para gerenciar a API e Frontend do MobileMed de forma simples e multiplataforma.

## 🚀 Uso Rápido

### Windows
```cmd
# Iniciar todos os serviços
mobilemed.bat start

# Ver status
mobilemed.bat status

# Parar todos os serviços
mobilemed.bat stop
```

### Linux/macOS/WSL
```bash
# Iniciar todos os serviços
./mobilemed.sh start

# Ver status
./mobilemed.sh status

# Parar todos os serviços
./mobilemed.sh stop
```

### Node.js (Multiplataforma)
```bash
# Funciona em qualquer sistema com Node.js
node mobilemed.js start
node mobilemed.js status
node mobilemed.js stop
```

## 📋 Comandos Disponíveis

| Comando | Descrição | Exemplo |
|---------|-----------|----------|
| `start` | Inicia API e/ou Frontend | `mobilemed.sh start` |
| `stop` | Para API e/ou Frontend | `mobilemed.sh stop` |
| `restart` | Reinicia serviços | `mobilemed.sh restart` |
| `status` | Mostra status dos serviços | `mobilemed.sh status` |
| `ngrok` | Configura acesso externo | `mobilemed.sh ngrok` |
| `help` | Mostra ajuda | `mobilemed.sh help` |

## 🎯 Comandos Específicos

### Iniciar apenas um serviço
```bash
# Apenas API
./mobilemed.sh start api

# Apenas Frontend
./mobilemed.sh start frontend
```

### Parar serviço específico
```bash
# Parar apenas API
./mobilemed.sh stop api

# Parar apenas Frontend
./mobilemed.sh stop frontend
```

## 🌐 Informações de Rede

Quando os serviços são iniciados, você verá:

- **API**: 
  - Local: `http://localhost:5000`
  - Rede: `http://[SEU_IP]:5000`
  - Health: `http://localhost:5000/health`
  - Swagger: `http://localhost:5000/swagger`

- **Frontend**: 
  - Local: `http://localhost:5005`
  - Rede: `http://[SEU_IP]:5005`

## 🔧 Pré-requisitos

### Para API (.NET)
- .NET 6.0 ou superior
- Comando: `dotnet --version`

### Para Frontend (React/Vite)
- Node.js 16+ e npm
- Comando: `node --version && npm --version`

### Para Ngrok (Opcional)
- Ngrok instalado e configurado
- Comando: `ngrok --version`

## 📁 Estrutura de Scripts

```
/
├── mobilemed.js          # Script principal Node.js
├── mobilemed.sh          # Wrapper Linux/macOS
├── mobilemed.bat         # Wrapper Windows
└── scripts/              # Scripts específicos
    ├── api/              # Scripts da API
    ├── frontend/         # Scripts do Frontend
    ├── ngrok/            # Scripts do Ngrok
    ├── deployment/       # Scripts de deploy
    ├── database/         # Scripts do banco
    └── testing/          # Scripts de teste
```

## 🐛 Solução de Problemas

### Porta já em uso
```bash
# Ver status dos serviços
./mobilemed.sh status

# Parar todos os serviços
./mobilemed.sh stop

# Verificar processos na porta (Linux/macOS)
sudo lsof -i :5000
sudo lsof -i :5005

# Verificar processos na porta (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :5005
```

### Serviço não inicia
1. Verifique se as dependências estão instaladas
2. Verifique se está no diretório correto
3. Verifique os logs do serviço
4. Tente reiniciar: `./mobilemed.sh restart`

### Problemas de permissão (Linux/macOS)
```bash
# Tornar scripts executáveis
chmod +x mobilemed.sh mobilemed.js
```

## 📱 Testando no Celular

**Rede Local**: Use o IP da sua máquina
- API: `http://192.168.x.x:5000`
- App: `http://192.168.x.x:5005`

## 🔄 Integração com Scripts Existentes

Os novos scripts utilizam e integram com os scripts existentes em `/scripts/`:

- **API**: Baseado em `scripts/api/start-api.sh`
- **Frontend**: Baseado em `scripts/frontend/start-frontend.sh`
- **Deploy**: Integra com `scripts/deployment/`

## 💡 Dicas

1. **Desenvolvimento**: Use `./mobilemed.sh start` para iniciar tudo
2. **Debug API**: Use `./mobilemed.sh start api` para testar apenas a API
3. **Debug Frontend**: Use `./mobilemed.sh start frontend` para testar apenas o frontend
4. **Status**: Sempre use `./mobilemed.sh status` para verificar o que está rodando
5. **Limpeza**: Use `./mobilemed.sh stop` antes de fechar o terminal

## 🆘 Suporte

Se encontrar problemas:

1. Execute `./mobilemed.sh status` para verificar o estado
2. Verifique se todas as dependências estão instaladas
3. Consulte os logs dos serviços individuais em `/scripts/`
4. Tente reiniciar: `./mobilemed.sh restart`