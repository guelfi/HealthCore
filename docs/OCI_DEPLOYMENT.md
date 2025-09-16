# Deploy na Oracle Cloud Infrastructure (OCI)

Este documento descreve como fazer o deploy da aplicação HealthCore na Oracle Cloud Infrastructure usando containers Docker via GitHub Actions.

## Pré-requisitos

- Conta na Oracle Cloud Infrastructure
- Instância de compute na OCI (Ubuntu 20.04+)
- Docker e Docker Compose instalados no servidor
- Nginx instalado no servidor
- Acesso SSH ao servidor OCI
- GitHub repository com Actions habilitado
- Secrets configurados no GitHub

## Configuração de Secrets no GitHub

Configure os seguintes secrets no seu repositório GitHub (Settings > Secrets and variables > Actions):

```
OCI_HOST=129.153.86.168
OCI_SSH_PRIVATE_KEY=<conteúdo da chave SSH privada>
OCI_USERNAME=<username do container registry>
OCI_PASSWORD=<password do container registry>
OCI_TENANCY=<tenancy namespace da OCI>
```

## Estrutura dos Containers

A aplicação é composta por dois containers principais que coexistem com o Batuara.net:

### 1. API Container (healthcore-api)
- **Porta**: 5000 (não conflita com Batuara.net:3000)
- **Base**: mcr.microsoft.com/dotnet/aspnet:8.0
- **Funcionalidades**:
  - API REST em .NET 8
  - Entity Framework Core
  - SQLite como banco de dados
  - Health checks configurados
  - Logs estruturados

### 2. Frontend Container (healthcore-frontend)
- **Porta**: 5005 (não conflita com Batuara.net:3000)
- **Base**: nginx:alpine
- **Funcionalidades**:
  - Aplicação React otimizada
  - Servida via Nginx
  - Configuração de proxy para API
  - Arquivos estáticos otimizados

### 3. Coexistência com Batuara.net
- **Batuara.net**: Continua rodando na porta 3000
- **HealthCore**: Roda nas portas 5000 (API) e 5005 (Frontend)
- **Nginx**: Configurado para proxy reverso de ambos os projetos

## Deploy Automático via GitHub Actions

### 1. Configuração Inicial no Servidor OCI

```bash
# Conectar ao servidor OCI
ssh -i ~/.ssh/oci-key ubuntu@129.153.86.168

# Verificar se Docker está instalado
docker --version
docker-compose --version

# Se não estiver instalado:
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu
# Fazer logout e login novamente
```

### 2. Configuração do Nginx para Coexistência

```bash
# Copiar arquivo de configuração do repositório
scp -i ~/.ssh/oci-key nginx/healthcore.conf ubuntu@129.153.86.168:~/

# Executar script de configuração
scp -i ~/.ssh/oci-key scripts/setup-nginx-oci.sh ubuntu@129.153.86.168:~/
ssh -i ~/.ssh/oci-key ubuntu@129.153.86.168 'sudo bash ~/setup-nginx-oci.sh'
```

### 3. Configuração de Portas na OCI

No painel da Oracle Cloud Infrastructure:

1. Acesse **Compute > Instances**
2. Clique na sua instância
3. Vá em **Virtual Cloud Network > Security Lists**
4. Adicione as seguintes regras de Ingress:

```
Porta 5000 (TCP) - Source: 0.0.0.0/0 - HealthCore API
Porta 5005 (TCP) - Source: 0.0.0.0/0 - HealthCore Frontend
```

### 4. Deploy via GitHub Actions

O deploy é automático quando você faz push para a branch main:

```bash
# Fazer alterações no código
git add .
git commit -m "Deploy HealthCore to OCI"
git push origin main
```

O GitHub Actions irá:
1. Fazer build das imagens Docker
2. Fazer push para o Container Registry
3. Conectar via SSH ao servidor OCI
4. Fazer pull das novas imagens
5. Parar containers antigos (se existirem)
6. Iniciar novos containers nas portas 5000 e 5005
7. Verificar status do deploy

## URLs de Acesso

Após o deploy bem-sucedido, a aplicação estará disponível em:

### Acesso Direto (via IP)
- **HealthCore Frontend**: http://129.153.86.168:5005
- **HealthCore API**: http://129.153.86.168:5000
- **Health Check**: http://129.153.86.168:5000/health
- **Batuara.net**: http://129.153.86.168:3000 (continua funcionando)

### Acesso via Nginx (após configurar DNS)
- **HealthCore**: https://healthcore.batuara.net
- **HealthCore API**: https://healthcore.batuara.net/api

## Deploy Automático via GitHub Actions

### 1. Configuração dos Secrets
No GitHub, vá em Settings > Secrets and variables > Actions e configure:

```
OCI_USERNAME=<seu_username>
OCI_PASSWORD=<seu_token>
OCI_TENANCY=<tenancy_ocid>
VITE_API_URL=http://<ip_da_instancia>
```

### 2. Trigger do Deploy
O deploy é executado automaticamente quando:
- Push na branch `main` ou `master`
- Pull Request para essas branches
- Execução manual via workflow_dispatch

### 3. Processo de Deploy
1. **Build**: Compila API (.NET) e Frontend (React)
2. **Test**: Executa testes automatizados
3. **Docker Build**: Cria imagens otimizadas
4. **Push**: Envia imagens para OCI Container Registry
5. **Deploy**: Atualiza containers na instância OCI

### 4. Monitoramento
- Acompanhe o progresso em Actions no GitHub
- Verifique logs dos containers: `docker-compose logs -f`
- Health check: `curl http://129.153.86.168:5000/health`

## Troubleshooting

### Problemas Comuns

#### 1. Containers não iniciam
```bash
# Verificar logs
docker-compose logs

# Verificar imagens
docker images | grep healthcore

# Recriar containers
docker-compose down
docker-compose up -d
```

#### 2. Erro de conexão com API
```bash
# Verificar se API está rodando
curl http://129.153.86.168:5000/health

# Verificar portas
netstat -tlnp | grep 5000

# Verificar firewall
sudo ufw status
```

#### 3. Frontend não carrega
```bash
# Verificar container do frontend
docker logs healthcore-frontend

# Verificar configuração nginx
sudo nginx -t
sudo systemctl status nginx
```

#### 4. Conflito de portas com Batuara.net
```bash
# Verificar portas em uso
sudo netstat -tlnp | grep -E ':(3000|5000|5005)'

# Parar containers conflitantes se necessário
docker stop <container_id>
```

### Comandos Úteis

```bash
# Reiniciar apenas o HealthCore (mantém Batuara.net rodando)
docker-compose restart

# Atualizar imagens
docker-compose pull
docker-compose up -d

# Limpar recursos não utilizados
docker system prune -f

# Verificar uso de recursos
docker stats
```

## Configuração de Portas na OCI

### Security Group Rules
```
Ingress Rules:
- Port 22 (SSH): 0.0.0.0/0
- Port 80 (HTTP): 0.0.0.0/0
- Port 443 (HTTPS): 0.0.0.0/0
- Port 5000 (API): 0.0.0.0/0 (opcional)
```

### Firewall Ubuntu (se necessário)
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw enable
```

## Monitoramento e Logs

### Verificar status dos containers
```bash
docker-compose ps
docker stats
```

### Visualizar logs
```bash
# Todos os serviços
docker-compose logs -f

# Apenas API
docker-compose logs -f healthcore-api

# Apenas Frontend
docker-compose logs -f healthcore-frontend
```

### Health Checks
```bash
# API Health
curl http://localhost:5000/health

# Frontend Health
curl http://localhost:80/health
```

## Backup e Persistência

### Volumes Docker
- `api_data`: Banco de dados SQLite
- `api_logs`: Logs da aplicação

### Backup do banco
```bash
# Backup
docker-compose exec healthcore-api cp /app/database/healthcore.db /app/database/backup_$(date +%Y%m%d_%H%M%S).db

# Restaurar
docker-compose exec healthcore-api cp /app/database/backup_YYYYMMDD_HHMMSS.db /app/database/healthcore.db
```

## Troubleshooting

### Problemas Comuns

1. **Container não inicia**
   ```bash
   docker-compose logs <service_name>
   docker-compose down && docker-compose up -d
   ```

2. **Erro de conexão API**
   - Verificar se a porta 5000 está aberta
   - Verificar variável VITE_API_URL no frontend
   - Verificar logs da API

3. **Frontend não carrega**
   - Verificar se o Nginx está rodando
   - Verificar configuração do proxy reverso
   - Verificar logs do container frontend

4. **Banco de dados não persiste**
   - Verificar se o volume está montado corretamente
   - Verificar permissões do diretório

### Comandos Úteis
```bash
# Reiniciar todos os serviços
docker-compose restart

# Rebuild e restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Limpar containers e volumes
docker-compose down -v
docker system prune -a
```

## URLs de Acesso

- **Frontend**: `http://<IP_DA_INSTANCIA>`
- **API**: `http://<IP_DA_INSTANCIA>:5000`
- **Swagger**: `http://<IP_DA_INSTANCIA>:5000/swagger`
- **Health Check API**: `http://<IP_DA_INSTANCIA>:5000/health`
- **Health Check Frontend**: `http://<IP_DA_INSTANCIA>/health`

## Segurança

### Recomendações
1. Configure HTTPS com certificado SSL
2. Use secrets para senhas e tokens
3. Configure firewall adequadamente
4. Mantenha o sistema atualizado
5. Monitore logs regularmente
6. Faça backups regulares do banco de dados

### SSL/HTTPS (Opcional)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d <seu_dominio>

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```