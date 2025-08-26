# 💻 Requisitos de Sistema - MobileMed

## 📋 Desenvolvimento Distribuído

Este documento detalha os requisitos específicos de sistema para o desenvolvimento distribuído do projeto MobileMed, onde o frontend e backend são desenvolvidos em máquinas diferentes.

---

## 🖥️ Configuração de Máquinas

### **Máquina 1 (Frontend) - Windows**

**Sistema Operacional:**
- Windows 10/11

**Tecnologias Necessárias:**
- Node.js 18+ para React + Vite
- Git para controle de versão
- Editor de código (VS Code recomendado)

**Scripts de Automação:**
- PowerShell (.ps1) - Para testes avançados
- Batch (.bat) - Para testes simples
- Configuração automática de .env

### **Máquina 2 (Backend) - macOS Catalina 10.15.7**

**Sistema Operacional:**
- macOS Catalina 10.15.7 (versão específica)

**Tecnologias Necessárias:**
- .NET Core 8 (funcionando perfeitamente)
- Git para controle de versão
- SQLite (incluído no .NET)

**Scripts de Automação:**
- Bash (.sh) - Scripts Unix/Linux
- Detecção automática de rede
- Gerenciamento de API

---

## ⚠️ Limitações Conhecidas

### **macOS Catalina 10.15.7**

**Status:** .NET Core 8 funcionando perfeitamente

**Considerações:**
- Firewall pode estar mais restritivo por padrão
- Sistema de segurança Gatekeeper mais rígido

**Soluções:**
- Configurar firewall manualmente via System Preferences
- Aceitar permissões de segurança quando solicitadas

### **Windows (Máquina Frontend)**

**Considerações:**
- PowerShell pode estar restrito por políticas
- Scripts .bat são mais universais
- Firewall do Windows pode bloquear conexões
- Antivírus pode interferir com desenvolvimento

---

## 🌐 Configuração de Rede

### **Portas e Protocolos**

| Componente | Porta | Protocolo | Acesso |
|------------|-------|-----------|---------|
| API (Backend) | 5000 | HTTP | 0.0.0.0 (todas interfaces) |
| Frontend | 5005 | HTTP | 0.0.0.0 (todas interfaces) |
| Swagger | 5000 | HTTP | /swagger endpoint |

### **CORS (Cross-Origin Resource Sharing)**

**Configuração Flexível:**
- Aceita conexões de redes locais:
  - 192.168.x.x (rede doméstica típica)
  - 10.x.x.x (rede empresarial)
  - 172.16-31.x.x (rede privada)
- Localhost em todas as variações
- Desenvolvimento adaptável para qualquer IP local

### **URLs de Acesso**

**Backend (macOS Catalina):**
- Local: `http://localhost:5000`
- Rede: `http://IP_MACOS:5000`
- Swagger: `http://IP_MACOS:5000/swagger`

**Frontend (Windows):**
- Local: `http://localhost:5005`
- Rede: `http://IP_WINDOWS:5005`

---

## 🛠️ Ferramentas de Desenvolvimento

### **Scripts de Automação Criados**

**Para Windows:**
- `scripts\test-connectivity.ps1` - Teste completo (PowerShell)
- `scripts\test-connectivity.bat` - Teste simples (Batch)
- `scripts\config-api.bat` - Configurador automático

**Para macOS:**
- `scripts/test-connectivity.sh` - Teste completo (Bash)
- `scripts/api.sh` - Gerenciador da API
- `scripts/servers.sh` - Plataforma completa

### **Documentação Específica**

- [DesenvolvimentoDistribuido.md](./DesenvolvimentoDistribuido.md) - Guia completo
- [GuiaMacOSCatalina.md](./GuiaMacOSCatalina.md) - Específico para macOS

---

## 🔧 Comandos de Verificação

### **macOS Catalina 10.15.7**

```bash
# Verificar .NET
dotnet --version
dotnet --info

# Descobrir IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Verificar firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Testar conectividade
./scripts/test-connectivity.sh
```

### **Windows**

```cmd
# Verificar Node.js
node --version
npm --version

# Descobrir IP
ipconfig | findstr "IPv4"

# Testar conectividade
scripts\test-connectivity.bat

# Configurar API
scripts\config-api.bat
```

---

## ✅ Checklist de Configuração

### **Máquina Backend (macOS Catalina)**

- [ ] .NET Core instalado e funcionando
- [ ] Projeto compilando sem erros
- [ ] IP local identificado
- [ ] API iniciando corretamente
- [ ] Firewall configurado para permitir porta 5000
- [ ] Swagger acessível externamente
- [ ] IP compartilhado com desenvolvedor Windows

### **Máquina Frontend (Windows)**

- [ ] Node.js e npm instalados
- [ ] Dependências do projeto instaladas
- [ ] Arquivo .env configurado com IP correto
- [ ] Frontend iniciando sem erros
- [ ] Conectividade com API testada
- [ ] Scripts de teste funcionando

---

## 📞 Suporte e Resolução de Problemas

### **Recursos Disponíveis**

1. **Guias Específicos**: Documentação detalhada para cada sistema
2. **Scripts de Teste**: Automação para validar conectividade
3. **Configuradores**: Ferramentas para setup rápido
4. **Logs Detalhados**: Informações para debugging

### **Problemas Comuns**

- **Conectividade**: Verificar IPs e portas
- **Firewall**: Configurar permissões adequadas
- **Compatibilidade**: Usar versões LTS quando necessário
- **Permissões**: Aceitar solicitações de segurança

---

**📧 Desenvolvido por Marco Guelfi**  
*Requisitos de Sistema - MobileMed Desenvolvimento Distribuído*