# 💈 Projeto Barbearia (SaaS)

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat&logo=dotnet)](https://dotnet.microsoft.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Blazor](https://img.shields.io/badge/Blazor-512BD4?style=flat&logo=blazor&logoColor=white)](https://blazor.net/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Sass](https://img.shields.io/badge/Sass-CC6699?style=flat&logo=sass&logoColor=white)](https://sass-lang.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white)](https://nginx.org/)
[![Cypress](https://img.shields.io/badge/Cypress-17202C?style=flat&logo=cypress&logoColor=white)](https://www.cypress.io/)
[![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=postman&logoColor=white)](https://www.postman.com/)

Este documento descreve a arquitetura e as tecnologias escolhidas para o desenvolvimento do sistema de agendamento para Barbearias, projetado como uma plataforma **Multi-Tenant (SaaS)**.

## 📋 Índice

- [🚀 Visão Geral](#-visão-geral)
- [🏛️ Arquitetura Multi-Tenant](#️-arquitetura-multi-tenant-saas)
- [🛠️ Stack de Tecnologia](#️-stack-de-tecnologia)
- [📐 Arquitetura e Princípios](#-arquitetura-e-princípios-de-design)
- [☁️ Estratégia de Deploy](#️-estratégia-de-deploy-cloud)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [🎯 Status do Desenvolvimento](#-status-atual-do-desenvolvimento)

## 🚀 Visão Geral

O projeto consiste em uma plataforma SaaS (Software as a Service) que permite a múltiplas Barbearias ("inquilinos" ou "tenants") gerenciarem seus negócios de forma independente e segura. Cada Barbearia terá acesso ao seu próprio ambiente dentro do sistema, que inclui uma API backend, uma aplicação dashboard web para administração e uma aplicação web mobile para clientes.

### 🎯 Funcionalidades Principais

**Para Barbearias (Tenants):**
- ✂️ Gestão completa de agendamentos
- 👥 Cadastro e gerenciamento de clientes
- 💼 Controle de serviços e preços
- 📊 Relatórios e dashboard analítico
- 💰 Controle financeiro e faturamento

**Para Clientes:**
- 📱 Agendamento via PWA mobile
- 🔍 Busca de Barbearias próximas
- ⭐ Avaliação de serviços
- 📅 Histórico de agendamentos
- 🔔 Notificações push

**Para Administradores SaaS:**
- 🏢 Gestão de Barbearias (tenants)
- 💳 Controle de planos e pagamentos
- 📈 Analytics da plataforma
- 🛠️ Configurações globais

## 🏛️ Arquitetura Multi-Tenant (SaaS)

A aplicação será construída desde o início para suportar múltiplos inquilinos, garantindo segurança e isolamento de dados.

*   **Modelo de Inquilinato:** Multi-tenancy será implementado em nível de aplicação com um **banco de dados compartilhado**.
*   **Identificação do Inquilino:** A identificação do `TenantId` (ID da Barbearia) será feita através de um *claim* no **token JWT** do usuário após o login. Cada requisição à API conterá essa informação, garantindo que o usuário só possa acessar os dados da sua própria Barbearia.
*   **Isolamento de Dados:** No MongoDB, todos os documentos relevantes (Agendamentos, Clientes, Serviços, etc.) conterão um campo `TenantId`. A camada de acesso a dados (Repository Pattern) será responsável por filtrar automaticamente todas as consultas com base no `TenantId` do usuário autenticado, prevenindo qualquer vazamento de dados entre inquilinos.

## 🛠️ Stack de Tecnologia

### ⚙️ Backend
| Componente | Tecnologia | Versão | Descrição |
|------------|------------|--------|-----------|
| **Framework** | .NET Core | 8.0 | API REST robusta e performática |
| **Autenticação** | JWT | - | Tokens com claims de `TenantId` |
| **Banco de Dados** | MongoDB | 7.0+ | NoSQL com schema compartilhado |
| **ORM** | MongoDB.Driver | - | Driver oficial para .NET |

### 💻 Aplicação Dashboard Web
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Framework** | Blazor Server | Interface administrativa responsiva |
| **UI Library** | MudBlazor | Componentes Material Design |
| **Styling** | Material UI + Sass/SCSS | Design system do Google com pré-processador CSS |

### 💻 Aplicação Desktop Web
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Framework** | React + Vite | Sistema para barbearias |
| **UI Library** | React UI Library (e.g., Material UI for React or Ant Design) | Componentes Material Design |
| **Styling** | Sass/SCSS | Pré-processador CSS para estilos modulares e reutilizáveis |

### 📱 Aplicação Mobile Web 
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Framework** | React + Vite | PWA para clientes |
| **UI Library** | React UI Library (e.g., Material UI for React or Ant Design) | Componentes Material Design |
| **Styling** | Sass/SCSS | Pré-processador CSS para estilos modulares e reutilizáveis |
| **Tipo** | Progressive Web App | Experiência nativa no mobile |

### 🖥️ Aplicação Administrativa SaaS
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Framework** | Blazor Server | Dashboard para gestão do SaaS |
| **UI Library** | MudBlazor | Componentes Material Design |
| **Styling** | Sass/SCSS | Pré-processador CSS para temas e customizações |
| **Funcionalidades** | - | Gestão de tenants, planos e pagamentos |

### 🎨 Estilização e Design
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Pré-processador** | Sass/SCSS | Variáveis, mixins, funções e aninhamento para CSS modular |
| **Metodologia** | BEM + SCSS | Organização de classes CSS com nomenclatura consistente |
| **Temas** | CSS Custom Properties | Variáveis CSS nativas para temas dinâmicos |
| **Responsividade** | CSS Grid + Flexbox | Layout responsivo e moderno |

### 🧪 Testes e Qualidade
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Testes E2E** | Cypress | Testes automatizados End-to-End para validação completa do fluxo de usuário |
| **Testes API** | Postman | Collections e environments para testes manuais e automatizados da API |

### ☁️ Infraestrutura
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Containerização** | Docker | Isolamento e portabilidade |
| **Proxy Reverso** | Nginx | Load balancing e SSL |
| **SO** | Ubuntu 22.04 | Sistema operacional do servidor |
| **Cloud** | Multi-provider | OCI, AWS, GCP, Azure |

## 📐 Arquitetura e Princípios de Design

O desenvolvimento seguirá as melhores práticas para construir uma aplicação SaaS robusta, escalável e de fácil manutenção.

*   **Clean Architecture:** A estrutura do projeto será baseada na Clean Architecture. As lógicas de negócio e de aplicação serão conscientemente desenhadas para operar em um contexto multi-tenant.

*   **Domain-Driven Design (DDD):** A entidade `Tenant` (ou `Barbearia`) será um agregado raiz central no domínio. Outros agregados, como `Agendamento` e `Cliente`, serão sempre associados a um `Tenant`.
*   **SOLID:** Os cinco princípios do SOLID serão aplicados.
*   **Test-Driven Development (TDD):** O desenvolvimento será orientado por testes, incluindo testes que garantam o correto isolamento de dados entre os inquilinos.
*   **Repository Pattern:** A implementação do repositório garantirá que todas as operações de dados sejam automaticamente filtradas pelo `TenantId` do contexto da requisição.
*   **Clean Code:** Serão aplicadas práticas de Clean Code.

## ☁️ Estratégia de Deploy (Cloud)

A implantação do projeto será feita em um ambiente de nuvem, utilizando contêineres Docker para garantir consistência e escalabilidade.

### 🐳 Arquitetura de Contêineres

O sistema será dividido em três contêineres Docker distintos:

1.  **Backend (.NET API):** Um contêiner para a API backend.
2.  **Frontend (Blazor & React):** Um contêiner servindo as aplicações frontend (a aplicação de desktop Blazor e a aplicação mobile PWA React).
3.  **Banco de Dados (MongoDB):** Um contêiner dedicado para a instância do MongoDB.

### 🔒 Rede e Segurança

*   **Proxy Reverso:** O Nginx atuará como um proxy reverso, direcionando o tráfego externo para os serviços apropriados.
*   **Acesso Externo:** Apenas o contêiner do Frontend será exposto à internet através de portas específicas configuradas no servidor de nuvem.
*   **Comunicação Interna:** A API e o Banco de Dados não serão acessíveis publicamente. A comunicação entre os contêineres (Frontend -> Backend -> Banco de Dados) ocorrerá em uma rede Docker privada, garantindo a segurança dos dados e da lógica de negócio.

### 📊 Provedores de Nuvem Avaliados

A tabela abaixo resume os provedores de nuvem considerados para a hospedagem do projeto:

| Provedor           | Status    | Custo/Mês  | Recursos | Observações           |
| ------------------ | --------- | ---------- | -------- | --------------------- |
| 🟢 **Oracle Cloud** | ✅ Testado | **Grátis** | 1GB RAM  | Always Free Tier      |
| 🟢 **Hostinger**    | ✅ Testado | $8         | 2GB RAM  | Boa performance       |
| 🟢 **DigitalOcean** | ✅ Testado | $12        | 2GB RAM  | Documentação excelente|
| 🟢 **Microsoft Azure**| ✅ Testado | $14        | 2GB RAM  | Integração Microsoft  |
| 🟢 **AWS EC2**      | ✅ Testado | $17        | 2GB RAM  | Mais recursos         |
| 🟢 **Google Cloud** | ✅ Testado | $15        | 2GB RAM  | Créditos iniciais     |
| 🟢 **Vultr**        | ✅ Testado | $12        | 2GB RAM  | Performance sólida    |
| 🟢 **Linode**       | ✅ Testado | $12        | 2GB RAM  | Suporte excelente     |

## 📂 Estrutura do Projeto

A estrutura de pastas do projeto foi desenhada para separar claramente as responsabilidades, seguindo os princípios da Clean Architecture.

```
/BarbeariaSaaS/
|
├── .git/                                           # Controle de versão Git
├── MaterialDesign/                                 # Mockups e designs das interfaces
|   ├── BarbeariaMobile/                            # Designs mobile (17 arquivos PNG)
|   └── BardeariaDesktop/                           # Designs desktop (10 arquivos PNG)
├── src/                                            # Código fonte da aplicação
|   ├── Api/                                        # Backend .NET Core 8
|   |   ├── Core/                                   # Camada de domínio e aplicação
|   |   |   ├── Barbearia.Domain/                   # Entidades, agregados e regras de negócio
|   |   |   └── Barbearia.Application/              # Casos de uso e serviços de aplicação
|   |   ├── Infrastructure/                         # Camada de infraestrutura
|   |   |   ├── Barbearia.Infrastructure.Data/      # Acesso a dados MongoDB
|   |   |   └── Barbearia.Infrastructure.Identity/  # Autenticação JWT
|   |   └── Presentation/                           # Camada de apresentação
|   |       └── Barbearia.Api/                      # Controllers e configuração da API
|   ├── Web.Desktop/                                # Aplicação React Desktop
|   |   ├── src/                                    # Código fonte React
|   |   ├── public/                                 # Recursos estáticos
|   |   └── styles/                                 # Arquivos Sass/SCSS
|   |       ├── abstracts/                          # Variáveis, mixins, funções
|   |       ├── base/                               # Reset, tipografia, elementos base
|   |       ├── components/                         # Estilos de componentes
|   |       ├── layout/                             # Header, footer, sidebar, grid
|   |       ├── pages/                              # Estilos específicos de páginas
|   |       ├── themes/                             # Temas claro/escuro
|   |       └── main.scss                           # Arquivo principal de importação
|   ├── Web.Mobile/                                 # PWA React Mobile
|   |   ├── src/                                    # Código fonte React PWA
|   |   ├── public/                                 # Recursos estáticos mobile
|   |   └── styles/                                 # Arquivos Sass/SCSS mobile
|   |       ├── abstracts/                          # Variáveis mobile, breakpoints
|   |       ├── base/                               # Reset mobile, tipografia touch
|   |       ├── components/                         # Componentes mobile-first
|   |       ├── layout/                             # Layouts mobile responsivos
|   |       ├── pages/                              # Páginas específicas mobile
|   |       ├── themes/                             # Temas mobile (claro/escuro)
|   |       └── main.scss                           # Arquivo principal mobile
|   └── Web.Admin/                                  # Dashboard admin SaaS (Blazor)
|       ├── wwwroot/                                # Recursos estáticos Blazor
|       └── Styles/                                 # Arquivos Sass/SCSS admin
|           ├── abstracts/                          # Variáveis admin, cores SaaS
|           ├── base/                               # Base styles para admin
|           ├── components/                         # Componentes MudBlazor customizados
|           ├── layout/                             # Layouts administrativos
|           ├── pages/                              # Páginas admin específicas
|           ├── themes/                             # Temas administrativos
|           └── main.scss                           # Arquivo principal admin
|
├── tests/                                          # Testes automatizados
|   ├── Api/                                        # Testes do backend
|   |   ├── Barbearia.Domain.Tests/                 # Testes unitários do domínio
|   |   └── Barbearia.Application.Tests/            # Testes dos casos de uso
|   ├── Web.Desktop.Tests/                          # Testes da aplicação desktop
|   ├── Web.Mobile.Tests/                           # Testes da aplicação mobile
|   └── cypress/                                    # Testes E2E automatizados
|       ├── e2e/                                    # Arquivos de teste Cypress
|       ├── fixtures/                               # Dados de teste
|       ├── support/                                # Comandos customizados e configurações
|       └── cypress.config.js                       # Configuração do Cypress
|
├── postman/                                        # Coleções e ambientes Postman
|   ├── collections/                                # Collections da API
|   ├── environments/                               # Environments (dev, staging, prod)
|   └── schemas/                                    # Schemas de validação JSON
|
├── docs/                                           # Documentação adicional
├── specs/                                          # Especificações e requisitos
├── .gitignore                                      # Arquivos ignorados pelo Git
├── README.md                                       # Documentação principal do projeto
└── set_gemini_key.bat                              # Script para configurar chave da API Gemini
```

### 🎯 Status Atual do Desenvolvimento

**✅ Completo:**
- Documentação detalhada e arquitetura definida
- Material Design com mockups visuais completos
- Estrutura de pastas organizada seguindo Clean Architecture
- Análise de provedores cloud realizada

**🔄 Em Desenvolvimento:**
- Implementação das entidades do domínio (Tenant, Agendamento, Cliente)
- Desenvolvimento da infraestrutura de dados MongoDB
- Criação da API backend com autenticação JWT
- Desenvolvimento das aplicações frontend (Desktop, Mobile, Admin)
- Implementação dos testes automatizados

## 🚀 Como Começar

### Pré-requisitos
- .NET 8.0 SDK
- Node.js 18+ (para React)
- Sass/SCSS (para pré-processamento CSS)
- MongoDB 7.0+
- Docker & Docker Compose
- VS Code / Kiro Dev
- Cypress (para testes E2E)
- Postman (para testes de API)
- Gemini CLI

### Configuração do Ambiente
```bash
# Clone o repositório
git clone <repository-url>
cd BarbeariaSaaS

# Configure a chave da API Gemini (se necessário)
.\set_gemini_key.bat

# Restaurar dependências .NET (quando implementado)
dotnet restore src/

# Instalar dependências Node.js (quando implementado)
npm install --prefix src/Web.Mobile/
```

### Executando o Projeto
```bash
# Subir MongoDB via Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Executar API (quando implementado)
dotnet run --project src/Api/Presentation/Barbearia.Api/

# Executar aplicação Desktop (quando implementado)
npm run dev --prefix src/Web.Desktop

# Executar aplicação Mobile (quando implementado)
npm run dev --prefix src/Web.Mobile

# Executar aplicação Admin (quando implementado)
dotnet run --project src/Web.Admin/

# Executar testes E2E com Cypress (quando implementado)
npx cypress open

# Executar testes de API com Postman (quando implementado)
newman run postman/collections/api-tests.json -e postman/environments/development.json
```

## 📞 Contato e Contribuição

Para dúvidas, sugestões ou contribuições, entre em contato através dos canais apropriados do projeto.

---

**Desenvolvido com uso de IA** 🧠