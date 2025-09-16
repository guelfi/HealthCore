# Configuração de Rede - HealthCore

## Portas Configuradas

### Backend (API)
- **Porta**: 5000
- **Host**: 0.0.0.0 (aceita conexões de qualquer IP)
- **URLs de acesso**:
  - Local: http://localhost:5000
  - Rede local: http://192.168.15.119:5000
  - Swagger: http://localhost:5000/swagger

### Frontend (Web)
- **Porta**: 5005
- **Host**: 0.0.0.0 (aceita conexões de qualquer IP)
- **URLs de acesso**:
  - Local: http://localhost:5005
  - Rede local: http://192.168.15.119:5005

## Como executar

### Backend
```bash
cd src/Api
dotnet run
```

### Frontend
```bash
cd src/Web
npm run dev
# ou para acesso de rede explícito:
npm run dev:network
```

## Configuração de Firewall

Para permitir acesso da rede local, certifique-se de que as portas estão liberadas:

### macOS
```bash
# Verificar se as portas estão abertas
sudo lsof -i :5000
sudo lsof -i :5005
```

### Windows
```cmd
# Adicionar regras de firewall
netsh advfirewall firewall add rule name="HealthCore API" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="HealthCore Web" dir=in action=allow protocol=TCP localport=5005
```

### Linux
```bash
# UFW
sudo ufw allow 5000
sudo ufw allow 5005

# iptables
sudo iptables -A INPUT -p tcp --dport 5000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5005 -j ACCEPT
```

## Descobrir IP da máquina

### macOS/Linux
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows
```cmd
ipconfig | findstr "IPv4"
```

## Variáveis de Ambiente

O frontend está configurado para usar as seguintes variáveis:

- `VITE_API_BASE_URL`: URL da API para desenvolvimento local
- `VITE_API_BASE_URL_NETWORK`: URL da API para acesso via rede

Atualize o arquivo `.env` com o IP correto da sua máquina se necessário.

## CORS

O backend está configurado para aceitar requisições dos seguintes origins:
- http://localhost:5005
- http://127.0.0.1:5005
- http://0.0.0.0:5005
- http://192.168.15.119:5005

Se o IP da sua máquina for diferente, atualize a configuração CORS no arquivo `src/Api/Program.cs`.