# 🍎 Guia Rápido - macOS Catalina 10.15.7 (Backend)

## ⚠️ Importante: macOS Catalina 10.15.7 com .NET Core 8

O macOS Catalina 10.15.7 está configurado e funcionando perfeitamente com .NET Core 8. O projeto executa integralmente sem problemas de compatibilidade.

---

## 🚀 Configuração Inicial

### 1. **Verificar .NET Core 8**

```bash
# Verificar se .NET está instalado
dotnet --version

# Verificar informações detalhadas
dotnet --info

# .NET Core 8 está funcionando perfeitamente no Catalina
```

### 2. **Preparar o Projeto**

```bash
# Clonar repositório
git clone [URL_DO_REPOSITORIO]
cd DesafioTecnico

# Testar compilação
cd src/Api
dotnet build

# Projeto compila e executa normalmente no Catalina
```

---

## 🌐 Configuração de Rede

### 1. **Descobrir Seu IP**

```bash
# Método preferido para Catalina
ifconfig | grep "inet " | grep -v 127.0.0.1

# Ou específico para interface Wi-Fi
ifconfig en0 | grep "inet "

# Se en0 não funcionar, tentar en1
ifconfig en1 | grep "inet "

# Listar todas as interfaces
ifconfig | grep -A 1 "flags=" | grep "inet "
```

### 2. **Executar a API**

```bash
# Voltar para raiz do projeto
cd ../../

# Executar script de inicialização
./scripts/api.sh start

# ANOTE O IP MOSTRADO - ex: 192.168.1.100
# Compartilhe este IP com o desenvolvedor Windows
```

---

## 🔥 Configuração do Firewall

### 1. **Verificar Status do Firewall**

```bash
# Verificar se firewall está ativo
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

### 2. **Configurar Permissões (Método Recomendado)**

1. Abrir **System Preferences** (Preferências do Sistema)
2. Ir em **Security & Privacy** (Segurança e Privacidade)
3. Clicar na aba **Firewall**
4. Clicar em **Firewall Options** (Opções do Firewall)
5. Clicar no **+** para adicionar aplicação
6. Encontrar e selecionar `dotnet` (geralmente em `/usr/local/share/dotnet/dotnet`)
7. Definir como **Allow incoming connections** (Permitir conexões de entrada)

### 3. **Verificar Porta**

```bash
# Verificar se a API está rodando na porta 5000
lsof -i :5000

# Testar conectividade local
curl http://localhost:5000/swagger
```

---

## 🧪 Testes

### 1. **Testar Conectividade**

```bash
# Executar script de teste
./scripts/test-connectivity.sh

# O script detectará automaticamente o Catalina
# e usará comandos compatíveis
```

### 2. **Testar da Máquina Windows**

Forneça seu IP para o desenvolvedor Windows testar:

```bash
# Exemplo de teste que ele fará:
# curl http://SEU_IP:5000/swagger
# scripts\test-connectivity.bat SEU_IP
```

---

## ⚠️ Problemas Comuns

### **Problema 1: Firewall Restritivo**

```bash
# Verificar e configurar firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Se ativo, adicionar exceção via System Preferences
# Security & Privacy > Firewall > Firewall Options
```

### **Problema 2: macOS bloqueia execução**

```bash
# Se aparecer aviso de segurança:
# 1. ACEITAR quando solicitado
# 2. Ou temporariamente desabilitar Gatekeeper:
sudo spctl --master-disable

# IMPORTANTE: Lembrar de reabilitar depois:
sudo spctl --master-enable
```

### **Problema 3: Conexão recusada**

```bash
# Verificar se API está rodando
./scripts/api.sh status

# Verificar firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Testar conectividade local primeiro
curl http://localhost:5000/swagger
```

### **Problema 4: Interface de rede não encontrada**

```bash
# Listar todas as interfaces
ifconfig

# Tentar diferentes interfaces
ifconfig en0  # Wi-Fi
ifconfig en1  # Ethernet
ifconfig en2  # Outras
```

---

## 📋 Checklist de Configuração

- [ ] ✅ .NET Core instalado e funcionando
- [ ] ✅ Projeto compilando sem erros
- [ ] ✅ IP local identificado
- [ ] ✅ API iniciando corretamente (`./scripts/api.sh start`)
- [ ] ✅ Firewall configurado para permitir porta 5000
- [ ] ✅ Swagger acessível em `http://localhost:5000/swagger`
- [ ] ✅ IP compartilhado com desenvolvedor Windows
- [ ] ✅ Teste de conectividade externo realizado

---

## 🆘 Suporte

Se encontrar problemas com o Catalina:

1. **Verificar logs**: `tail -f ../log/api.log`
2. **Testar localmente primeiro**: `curl http://localhost:5000/swagger`
3. **Verificar status da API**: `./scripts/api.sh status`
4. **Testar conectividade**: `./scripts/test-connectivity.sh`

---

**📧 Desenvolvido por Marco Guelfi**  
*Guia para macOS Catalina 10.15.7 - MobileMed Backend*