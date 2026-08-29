# 🏥 HealthCore

> **Sistema de Gestão Médica Inteligente** - MVP de SaaS para controle de pacientes e exames médicos com modalidades DICOM

![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET_8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

## 📋 Sobre o Projeto

O **HealthCore** é um sistema de gestão médica moderno e inteligente, desenvolvido como MVP de uma solução SaaS para profissionais de saúde. O sistema permite o controle completo de pacientes e seus exames médicos, com suporte a modalidades DICOM e garantias de idempotência para operações críticas.

### 🎯 Principais Funcionalidades

- **Gestão de Pacientes**: Cadastro, consulta, atualização e controle de histórico clínico
- **Gestão de Exames**: Suporte completo a modalidades DICOM com controle de idempotência
- **Autenticação Segura**: Sistema JWT com controle de acesso baseado em perfis
- **Interface Responsiva**: Design moderno e mobile-first com Material-UI
- **API RESTful**: Endpoints documentados com Swagger/OpenAPI
- **Conformidade LGPD**: Implementação completa da Lei Geral de Proteção de Dados

### 🏥 Modalidades DICOM Suportadas

O sistema suporta as principais modalidades de imagem médica definidas pelo padrão DICOM:

- **CR** (Computed Radiography) - Radiografia Computadorizada
- **CT** (Computed Tomography) - Tomografia Computadorizada
- **DX** (Digital Radiography) - Radiografia Digital
- **MG** (Mammography) - Mamografia
- **MR** (Magnetic Resonance) - Ressonância Magnética
- **NM** (Nuclear Medicine) - Medicina Nuclear
- **OT** (Other) - Outras modalidades
- **PT** (Positron Emission Tomography) - Tomografia por Emissão de Pósitrons
- **RF** (Radio Fluoroscopy) - Radiofluoroscopia
- **US** (Ultrasound) - Ultrassom
- **XA** (X-Ray Angiography) - Angiografia por Raios-X

### ⚡ Idempotência

O sistema implementa **idempotência** para operações críticas, especialmente no cadastro de exames. Isso significa que:

- **Requisições duplicadas** não criam registros múltiplos
- **Chave de idempotência** (`idempotencyKey`) garante unicidade
- **Operações simultâneas** são tratadas de forma segura
- **Consistência de dados** é mantida mesmo em cenários de alta concorrência

A idempotência é essencial em sistemas médicos para evitar duplicação de exames e garantir a integridade dos dados clínicos.

## 🚀 Início Rápido

### Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Instalação para Desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/HealthCore.git
cd HealthCore

# 2. Instale dependências do frontend
cd src/Web
npm install
cd ../..
```

### Execução Local

**Opção 1: Scripts Automatizados (Recomendado)**

```bash
# Linux/macOS
./healthcore.sh start

# Windows
healthcore.bat start
```

**Opção 2: Execução Manual**

```bash
# Terminal 1 - API Backend
cd src/Api
dotnet run

# Terminal 2 - Frontend
cd src/Web
npm run dev
```

### Deploy com Docker (Produção/Servidor)

```bash
# Construir e subir os serviços
docker compose up -d --build

# Verificar status
docker compose ps

# Logs (opcional)
docker compose logs -f
```

### Acesso ao Sistema

- **Frontend**: http://localhost:5005
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health

## 📚 Documentação

Índice completo em [`docs/README.md`](docs/README.md).

### 🧭 Plano ativo (fonte da verdade)

- **[Status](docs/project-control/STATUS.md)** - Release atual e gates restantes
- **[Backlog](docs/project-control/BACKLOG.md)** - Itens done/pending
- **[Plano UI/UX SaaS](docs/project-control/UI_UX_SAAS_IMPLEMENTATION_PLAN_2026-07-23.md)** - Fases 0-10 (OCI publicada)
- **[Master plan](docs/project-control/MASTER_PLAN.md)** - Fases P00-P16
- **[Requisitos SaaS / roadmap](docs/frontend/saas-ui-ux-requirements.md)** - Inclui PIX, e-mail e WhatsApp futuros

### 📖 Referência técnica

- **[Arquitetura](docs/architecture.md)** - Clean Architecture, DDD e padrões
- **[Estrutura](docs/structure.md)** - Organização de diretórios
- **[Requisitos](docs/requirements.md)** - Requisitos funcionais e não funcionais
- **[LGPD](docs/lgpd_readme.md)** - Conformidade
- **[Deploy OCI](docs/OCI_DEPLOYMENT.md)** - Produção na Oracle Cloud
- **[Execução](docs/execute.md)** - Como rodar localmente
- **[Contribuição](docs/contributing.md)** - Como contribuir

## 🏗️ Arquitetura

### Backend (.NET 8)
- **Clean Architecture** com separação clara de responsabilidades
- **Domain-Driven Design (DDD)** para modelagem de negócio
- **Repository Pattern** para acesso a dados
- **Entity Framework Core** com SQLite
- **JWT Authentication** com controle de acesso
- **Serilog** para logging estruturado
- **Health Checks** para monitoramento

### Frontend (React + TypeScript)
- **React 19** com hooks modernos
- **TypeScript** para tipagem estática
- **Vite** para build e desenvolvimento
- **Material-UI** para componentes de interface
- **Zustand** para gerenciamento de estado
- **React Hook Form** com validação Zod
- **Axios** para comunicação com API

### Infraestrutura
- **Docker** para containerização
- **Nginx** como proxy reverso
- **GitHub Actions** para CI/CD
- **Multi-cloud** (OCI, AWS, GCP, Azure)

## 🧪 Testes

### Testes Unitários
```bash
# Backend (.NET)
cd src/Api
dotnet test

# Frontend (Vitest)
cd src/Web
npm run test
npm run test:coverage
```

### Testes E2E
```bash
# Cypress (em desenvolvimento)
npm run test:e2e
```

### Testes de Conectividade
```bash
# Scripts de teste de conectividade
cd src/Web
npm run test:connectivity
npm run test:api
```

## 🚀 CI/CD

### GitHub Actions
O projeto utiliza GitHub Actions para:
- **Build automatizado** do backend e frontend
- **Execução de testes** unitários e de integração
- **Deploy automatizado** para ambientes de produção
- **Análise de código** e verificação de qualidade

### Pipeline de Deploy
1. **Build** - Compilação e otimização
2. **Test** - Execução de testes automatizados
3. **Security** - Verificação de vulnerabilidades
4. **Deploy** - Deploy para ambiente de produção

## 📊 Comandos Disponíveis

### Scripts Principais
```bash
# Gerenciamento de serviços
./healthcore.sh start     # Inicia API e Frontend
./healthcore.sh stop      # Para todos os serviços
./healthcore.sh restart   # Reinicia serviços
./healthcore.sh status    # Status dos serviços
./healthcore.sh logs      # Visualiza logs

# Comandos específicos
./healthcore.sh start api      # Apenas API
./healthcore.sh start frontend # Apenas Frontend
./healthcore.sh logs api       # Logs da API
```

### Scripts de Desenvolvimento
```bash
# Frontend
npm run dev              # Desenvolvimento
npm run build            # Build de produção
npm run lint             # Verificação de código
npm run test             # Testes unitários

# Backend
dotnet run               # Execução
dotnet build             # Build
dotnet test              # Testes
```

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
4. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. **Push** para a branch (`git push origin feature/AmazingFeature`)
6. **Abra** um Pull Request

Leia o [Guia de Contribuição](docs/contributing.md) para mais detalhes.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Equipe HealthCore
- **Arquitetura**: Clean Architecture + DDD
- **UI/UX**: Material Design System
- **DevOps**: Docker + GitHub Actions

## 📞 Suporte

Para suporte técnico ou dúvidas sobre LGPD:
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/HealthCore/issues)
- **Documentação**: Consulte os arquivos na pasta `/docs`

---

<div align="center">
  <strong>HealthCore</strong> - Sistema de Gestão Médica Inteligente<br>
  Desenvolvido com 💙 e 🧠 para profissionais de saúde
</div>