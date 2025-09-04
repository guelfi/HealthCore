#!/bin/bash

# 🚀 Oracle Cloud Infrastructure (OCI) Setup Script
# Este script ajuda a configurar o ambiente OCI para deploy

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  $1"
    echo "==========================================${NC}"
}

# Verificar se o OCI CLI está instalado
check_oci_cli() {
    print_header "Verificando OCI CLI"
    
    if ! command -v oci &> /dev/null; then
        print_error "OCI CLI não está instalado!"
        print_info "Para instalar o OCI CLI, visite: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
        exit 1
    fi
    
    print_success "OCI CLI encontrado: $(oci --version)"
}

# Verificar se o kubectl está instalado
check_kubectl() {
    print_header "Verificando kubectl"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl não está instalado!"
        print_info "Para instalar o kubectl, visite: https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    
    print_success "kubectl encontrado: $(kubectl version --client --short 2>/dev/null || kubectl version --client)"
}

# Verificar se o Docker está instalado
check_docker() {
    print_header "Verificando Docker"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado!"
        print_info "Para instalar o Docker, visite: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker não está rodando!"
        print_info "Inicie o Docker e tente novamente."
        exit 1
    fi
    
    print_success "Docker encontrado e rodando: $(docker --version)"
}

# Verificar configuração do OCI
check_oci_config() {
    print_header "Verificando Configuração OCI"
    
    if [ ! -f ~/.oci/config ]; then
        print_error "Arquivo de configuração OCI não encontrado!"
        print_info "Execute 'oci setup config' para configurar."
        exit 1
    fi
    
    print_success "Arquivo de configuração OCI encontrado"
    
    # Testar conectividade
    print_info "Testando conectividade com OCI..."
    if oci iam tenancy get --tenancy-id $(oci iam tenancy get --query 'data.id' --raw-output 2>/dev/null) &> /dev/null; then
        print_success "Conectividade com OCI OK"
    else
        print_error "Falha na conectividade com OCI"
        print_info "Verifique suas credenciais e configuração."
        exit 1
    fi
}

# Listar compartments disponíveis
list_compartments() {
    print_header "Compartments Disponíveis"
    
    print_info "Listando compartments..."
    oci iam compartment list --query 'data[].{Name:name,ID:id,State:"lifecycle-state"}' --output table 2>/dev/null || {
        print_error "Falha ao listar compartments"
        return 1
    }
}

# Listar clusters OKE
list_oke_clusters() {
    print_header "Clusters OKE Disponíveis"
    
    read -p "Digite o OCID do compartment: " compartment_id
    
    if [ -z "$compartment_id" ]; then
        print_warning "OCID do compartment não fornecido, pulando..."
        return 0
    fi
    
    print_info "Listando clusters OKE..."
    oci ce cluster list --compartment-id "$compartment_id" --query 'data[].{Name:name,ID:id,State:"lifecycle-state"}' --output table 2>/dev/null || {
        print_error "Falha ao listar clusters OKE"
        return 1
    }
}

# Configurar kubeconfig para OKE
setup_kubeconfig() {
    print_header "Configurando kubeconfig para OKE"
    
    read -p "Digite o OCID do cluster OKE: " cluster_id
    read -p "Digite a região (ex: us-ashburn-1): " region
    
    if [ -z "$cluster_id" ] || [ -z "$region" ]; then
        print_warning "Informações insuficientes, pulando configuração do kubeconfig..."
        return 0
    fi
    
    print_info "Configurando kubeconfig..."
    oci ce cluster create-kubeconfig \
        --cluster-id "$cluster_id" \
        --file ~/.kube/config \
        --region "$region" \
        --token-version 2.0.0 \
        --kube-endpoint PUBLIC_ENDPOINT
    
    print_success "kubeconfig configurado com sucesso!"
    
    # Testar conectividade
    print_info "Testando conectividade com o cluster..."
    if kubectl cluster-info &> /dev/null; then
        print_success "Conectividade com cluster OK"
        kubectl get nodes
    else
        print_error "Falha na conectividade com o cluster"
    fi
}

# Verificar Container Registry
check_container_registry() {
    print_header "Verificando Container Registry"
    
    read -p "Digite o namespace da tenancy: " tenancy_namespace
    read -p "Digite a região do registry (ex: us-ashburn-1): " registry_region
    
    if [ -z "$tenancy_namespace" ] || [ -z "$registry_region" ]; then
        print_warning "Informações insuficientes, pulando verificação do registry..."
        return 0
    fi
    
    print_info "Verificando repositórios no Container Registry..."
    
    # Listar repositórios
    oci artifacts container repository list \
        --compartment-id $(oci iam tenancy get --query 'data.id' --raw-output) \
        --query 'data.items[].{Name:"display-name",State:"lifecycle-state"}' \
        --output table 2>/dev/null || {
        print_warning "Falha ao listar repositórios ou nenhum repositório encontrado"
    }
}

# Testar build das imagens Docker
test_docker_build() {
    print_header "Testando Build das Imagens Docker"
    
    # Verificar se estamos na raiz do projeto
    if [ ! -f "src/Api/Dockerfile" ] || [ ! -f "src/Web/Dockerfile" ]; then
        print_error "Dockerfiles não encontrados! Execute este script da raiz do projeto."
        return 1
    fi
    
    print_info "Testando build da imagem da API..."
    if docker build -f src/Api/Dockerfile -t mobilemed-api:test . &> /dev/null; then
        print_success "Build da API OK"
        docker rmi mobilemed-api:test &> /dev/null
    else
        print_error "Falha no build da API"
    fi
    
    print_info "Testando build da imagem do Frontend..."
    if docker build -f src/Web/Dockerfile -t mobilemed-frontend:test . &> /dev/null; then
        print_success "Build do Frontend OK"
        docker rmi mobilemed-frontend:test &> /dev/null
    else
        print_error "Falha no build do Frontend"
    fi
}

# Gerar template de secrets para GitHub
generate_secrets_template() {
    print_header "Gerando Template de Secrets para GitHub"
    
    cat > github-secrets-template.txt << EOF
# 🔑 GitHub Secrets Template para OCI Deploy
# Copie e cole estes valores no GitHub: Settings > Secrets and variables > Actions

# === OCI Authentication ===
OCI_USER_OCID=ocid1.user.oc1..aaaaaaaa...
OCI_FINGERPRINT=aa:bb:cc:dd:ee:ff:gg:hh:ii:jj:kk:ll:mm:nn:oo:pp
OCI_TENANCY_OCID=$(oci iam tenancy get --query 'data.id' --raw-output 2>/dev/null || echo 'ocid1.tenancy.oc1..aaaaaaaa...')
OCI_REGION=us-ashburn-1
OCI_PRIVATE_KEY=|
  -----BEGIN PRIVATE KEY-----
  [Sua chave privada aqui]
  -----END PRIVATE KEY-----

# === Container Registry ===
OCI_USERNAME=<tenancy-namespace>/<username>
OCI_PASSWORD=<auth-token>
OCI_TENANCY=<tenancy-namespace>

# === Kubernetes ===
OKE_CLUSTER_ID=ocid1.cluster.oc1..aaaaaaaa...

# === Application ===
DOMAIN_NAME=mobilemed.example.com
VITE_API_URL=https://mobilemed.example.com/api

# === Database (Opcional) ===
DATABASE_CONNECTION_STRING=Server=...;Database=...;User Id=...;Password=...;
EOF

    print_success "Template de secrets gerado em: github-secrets-template.txt"
    print_info "Edite o arquivo e configure os secrets no GitHub."
}

# Menu principal
show_menu() {
    echo
    print_header "🚀 OCI Setup Menu"
    echo "1. Verificar pré-requisitos"
    echo "2. Listar compartments"
    echo "3. Listar clusters OKE"
    echo "4. Configurar kubeconfig"
    echo "5. Verificar Container Registry"
    echo "6. Testar build Docker"
    echo "7. Gerar template de secrets"
    echo "8. Executar verificação completa"
    echo "0. Sair"
    echo
}

# Verificação completa
full_check() {
    print_header "🔍 Verificação Completa do Ambiente"
    
    check_oci_cli
    check_kubectl
    check_docker
    check_oci_config
    
    print_success "Verificação completa dos pré-requisitos concluída!"
    
    echo
    print_info "Próximos passos:"
    echo "1. Configure um cluster OKE se ainda não tiver"
    echo "2. Configure o kubeconfig (opção 4)"
    echo "3. Verifique o Container Registry (opção 5)"
    echo "4. Teste o build das imagens (opção 6)"
    echo "5. Gere o template de secrets (opção 7)"
    echo "6. Configure os secrets no GitHub"
}

# Loop principal
main() {
    print_header "🚀 Oracle Cloud Infrastructure Setup"
    print_info "Este script ajuda a configurar o ambiente OCI para deploy."
    
    while true; do
        show_menu
        read -p "Escolha uma opção: " choice
        
        case $choice in
            1)
                check_oci_cli
                check_kubectl
                check_docker
                check_oci_config
                ;;
            2)
                list_compartments
                ;;
            3)
                list_oke_clusters
                ;;
            4)
                setup_kubeconfig
                ;;
            5)
                check_container_registry
                ;;
            6)
                test_docker_build
                ;;
            7)
                generate_secrets_template
                ;;
            8)
                full_check
                ;;
            0)
                print_success "Saindo..."
                exit 0
                ;;
            *)
                print_error "Opção inválida!"
                ;;
        esac
        
        echo
        read -p "Pressione Enter para continuar..."
    done
}

# Executar script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi