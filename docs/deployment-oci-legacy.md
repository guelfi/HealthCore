# 🚀 Oracle Cloud Infrastructure (OCI) Deployment Setup

Este guia explica como configurar o deploy automático para a Oracle Cloud Infrastructure usando GitHub Actions com deploy direto via SSH.

## 📋 Pré-requisitos

### 1. Instância OCI
- Instância Ubuntu na Oracle Cloud Infrastructure
- Docker e Docker Compose instalados
- Nginx configurado como reverse proxy
- Portas 5000 (API) e 5005 (Frontend) abertas no Security Group

### 2. Chave SSH
- Par de chaves SSH gerado
- Chave pública adicionada à instância OCI
- Chave privada configurada nos secrets do GitHub

## 🔑 Configuração de Secrets no GitHub

Vá para **Settings > Secrets and variables > Actions** no seu repositório GitHub e adicione os seguintes secrets:

### Secrets Obrigatórios

```bash
# SSH Connection
OCI_SSH_PRIVATE_KEY=<conteudo-do-secret-no-GitHub>
OCI_HOST=129.153.86.168
```

### Como obter os valores:

1. **OCI_SSH_PRIVATE_KEY**: Conteúdo completo da sua chave privada SSH
2. **OCI_HOST**: IP público da sua instância OCI

### Secrets Opcionais

```bash
# Database (se usando RDS/ATP)
DATABASE_CONNECTION_STRING=Server=...;Database=...;User Id=...;Password=...;

# Monitoring (se usando)
APPLICATION_INSIGHTS_KEY=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
```

## 🛠️ Como Obter os Valores dos Secrets

### 1. OCI User OCID
```bash
oci iam user list --query "data[?name=='<your-username>'].id | [0]"
```

### 2. OCI Tenancy OCID
```bash
oci iam tenancy get --tenancy-id <tenancy-id> --query "data.id"
```

### 3. OCI Fingerprint
Após criar a API Key no console OCI, o fingerprint será exibido.

### 4. OCI Private Key
Chave privada gerada ao criar a API Key (arquivo .pem).

### 5. Container Registry Username
Formato: `<tenancy-namespace>/<username>`

### 6. Container Registry Password
Auth Token gerado no console OCI em **Identity > Users > Auth Tokens**.

### 7. OKE Cluster ID
```bash
oci ce cluster list --compartment-id <compartment-id> --query "data[0].id"
```

## 🏗️ Estrutura de Deploy

### Ambientes
- **staging**: Deploy automático em push para main/master
- **production**: Deploy manual via workflow_dispatch

### Recursos Criados
- **API**: Deployment com 2 réplicas, Service ClusterIP
- **Frontend**: Deployment com 2 réplicas, Service ClusterIP
- **Ingress**: Nginx Ingress com SSL/TLS automático
- **Secrets**: Kubernetes secrets para configurações sensíveis

## 🔧 Configuração do Cluster

### 1. Instalar Nginx Ingress Controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### 2. Instalar Cert-Manager (para SSL)
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

### 3. Configurar ClusterIssuer para Let's Encrypt
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### 4. Criar Secrets do Kubernetes
```bash
# Database connection
kubectl create secret generic healthcore-secrets \
  --from-literal=database-connection="Server=...;Database=...;User Id=...;Password=...;"
```

## 🚀 Como Fazer Deploy

### Deploy Automático (Staging)
1. Faça push para a branch `main` ou `master`
2. O workflow será executado automaticamente
3. A aplicação será deployada no ambiente de staging

### Deploy Manual (Production)
1. Vá para **Actions** no GitHub
2. Selecione o workflow "Deploy to Oracle Cloud Infrastructure (OCI)"
3. Clique em "Run workflow"
4. Selecione "production" como ambiente
5. Clique em "Run workflow"

## 📊 Monitoramento

### Health Checks
- **API**: `https://your-domain.com/api/health`
- **Frontend**: `https://your-domain.com/health`

### Logs
```bash
# API logs
kubectl logs -l app=healthcore-api -f

# Frontend logs
kubectl logs -l app=healthcore-frontend -f

# Ingress logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f
```

### Status dos Deployments
```bash
kubectl get deployments
kubectl get services
kubectl get ingress
kubectl get pods
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Falha na autenticação OCI**
   - Verifique se todos os secrets OCI estão corretos
   - Confirme se a API Key está ativa no console OCI

2. **Falha no push da imagem**
   - Verifique se o Container Registry está habilitado
   - Confirme se o auth token está válido

3. **Falha no deploy Kubernetes**
   - Verifique se o cluster OKE está ativo
   - Confirme se o kubeconfig está correto

4. **Problemas de SSL/TLS**
   - Verifique se o cert-manager está instalado
   - Confirme se o DNS está apontando para o Load Balancer

### Comandos Úteis

```bash
# Verificar status do cluster
oci ce cluster get --cluster-id <cluster-id>

# Listar node pools
oci ce node-pool list --compartment-id <compartment-id>

# Verificar Load Balancer
oci lb load-balancer list --compartment-id <compartment-id>

# Testar conectividade
kubectl cluster-info
kubectl get nodes
```

## 📚 Recursos Adicionais

- [OCI Documentation](https://docs.oracle.com/en-us/iaas/)
- [OKE Documentation](https://docs.oracle.com/en-us/iaas/Content/ContEng/home.htm)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Nota**: Substitua todos os valores de exemplo (`<...>`) pelos valores reais do seu ambiente OCI.