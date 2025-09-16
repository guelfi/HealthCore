## 🛠️ Stack de Tecnologia

### ⚙️ Back end
| Componente | Tecnologia | Versão | Descrição |
|------------|------------|--------|-----------|
| **Framework** | .NET Core | 8.0 | API REST robusta e performática |
| **Autenticação** | JWT | - | Tokens com claims |
| **Banco de Dados** | SQLite | 3.x | Banco de dados relacional embarcado |
| **ORM** | Entity Framework Core | - | ORM oficial para .NET |

### 💻 Aplicação Front end web
| Componente | Tecnologia | Descrição |
|------------|------------|-----------|
| **Framework** | React + Vite | Sistema HealthCore para gestão de pacientes e exames médicos |
| **UI Library** | React UI Library (e.g., Material UI for React or Ant Design) | Componentes Material Design |

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

O desenvolvimento seguirá as melhores práticas para construir uma aplicação robusta, escalável e de fácil manutenção.

*   **Clean Architecture:** A estrutura do projeto será baseada na Clean Architecture. As lógicas de negócio e de aplicação serão conscientemente desenhadas para operar em um contexto multi-tenant.

*   **Domain-Driven Design (DDD):** 
*   **SOLID:** Os cinco princípios do SOLID serão aplicados.
*   **Test-Driven Development (TDD):** O desenvolvimento será orientado por testes
*   **Repository Pattern:** A implementação do repositório garantirá todas as operações de dados
*   **Clean Code:** Serão aplicadas práticas de Clean Code.

## ☁️ Estratégia de Deploy (Cloud)

A implantação do projeto será feita em um ambiente de nuvem, utilizando contêineres Docker para garantir consistência e escalabilidade.

### 🐳 Arquitetura de Contêineres

O sistema será dividido em três contêineres Docker distintos:

1.  **Backend (.NET API):** Um contêiner para a API backend.
2.  **Frontend (React):** Um contêiner servindo as aplicações frontend
3.  **Banco de Dados (SQLite):** Um contêiner dedicado para a instância do SQLite.

### 🔒 Rede e Segurança

*   **Proxy Reverso:** O Nginx atuará como um proxy reverso, direcionando o tráfego externo para os serviços apropriados.
*   **Acesso Externo:** Apenas o contêiner do Frontend será exposto à internet através de portas específicas configuradas no servidor de nuvem.
*   **Comunicação Interna:** A API e o Banco de Dados não serão acessíveis publicamente. A comunicação entre os contêineres (Frontend -> Backend -> Banco de Dados) ocorrerá em uma rede Docker privada, garantindo a segurança dos dados e da lógica de negócio.