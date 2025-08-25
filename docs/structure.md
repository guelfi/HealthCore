# 📂 Estrutura do Projeto

Este documento descreve a estrutura de diretórios do projeto, fornecendo uma visão clara de onde os diferentes componentes residem.

## 🚀 Tecnologias Utilizadas

Aqui estão algumas das principais tecnologias utilizadas neste projeto:

![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)

## 📁 Layout de Diretórios

-   **`/` (Diretório Raiz)**: O diretório principal do projeto.
    -   `├───.vscode/`: ⚙️ Contém configurações e definições específicas do Visual Studio Code.
    -   `├───docs/`: 📚 Arquivos de documentação do projeto, incluindo arquitetura, guias de configuração e listas de tarefas.
    -   `├───log/`: 📝 Armazena logs da aplicação.
    -   `├───postman/`: 📬 Contém coleções e ambientes do Postman para testes de API.
    -   `├───reports/`: 📊 Relatórios gerados, possivelmente de testes ou análise de código. 
    -   `├───scripts/`: 📜 Vários scripts shell para automação, como iniciar servidores ou executar testes.
    -   `├───src/`: 📦 Código-fonte das aplicações principais.
        -   `├───Api/`: 🌐 Projeto da API de backend (C# .NET).
            -   `├───Core/`: 🎯 Lógica de negócios central e serviços da aplicação.
                -   `├───Application/`: 🚀 Camada de aplicação, contendo DTOs e serviços.
                    -   `├───DTOs/`: 📝 Objetos de Transferência de Dados para modelos de requisição e resposta.
                        -   `├───Admin/`: 🔒 DTOs específicos para funcionalidades administrativas.
                        -   `└───Auth/`: 🔑 DTOs relacionados à autenticação e autorização.
                    -   `└───Services/`: 🛠️ Serviços de lógica de negócios que orquestram operações.
                -   `└───Domain/`: 🏛️ Camada de domínio, definindo entidades e regras de negócio.
                    -   `├───Entities/`: 🧩 Entidades centrais do domínio.
                    -   `└───Enums/`: 🏷️ Enumerações utilizadas em todo o domínio.
            -   `├───database/`: 🗄️ Arquivos de banco de dados (ex: arquivo `.db` do SQLite).
            -   `├───Infrastructure/`: 🏗️ Preocupações de infraestrutura como acesso a dados e middlewares.
                -   `├───Data/`: 💾 Contexto do banco de dados e configurações de acesso a dados.
                -   `└───Middleware/`: 🔗 Componentes de middleware personalizados (ex: blacklist de tokens).
            -   `├───Migrations/`: 🔄 Scripts de migração de banco de dados.
            -   `└───Presentation/`: 🖥️ Controladores de API e lógica relacionada à apresentação.
        -   `├───log/`: 📝 Logs específicos da execução do código-fonte (se houver, separado do log raiz).
        -   `└───Web/`: 💻 Aplicação web frontend (React/TypeScript).
            -   `├───public/`: 🌐 Ativos estáticos servidos diretamente pelo servidor web.
            -   `└───src/`: ⚛️ Código-fonte da aplicação React.
                -   `├───application/`: 🚀 Lógica específica da aplicação, stores e casos de uso.
                    -   `├───services/`: 🛠️ Serviços frontend para busca de dados ou lógica complexa.
                    -   `├───stores/`: 💾 Stores de gerenciamento de estado (ex: Zustand).
                    -   `└───use-cases/`: 💡 Encapsula interações de usuário específicas ou fluxos de negócios.
                -   `├───domain/`: 🏛️ Modelos de domínio frontend, enums e interfaces.
                    -   `├───entities/`: 🧩 Modelos de dados frontend.
                    -   `├───enums/`: 🏷️ Enumerações para uso no frontend.
                    -   `└───interfaces/`: 🤝 Interfaces TypeScript para contratos.
                -   `├───infrastructure/`: 🏗️ Preocupações de infraestrutura frontend como clientes de API e utilitários.
                    -   `├───api/`: 📡 Configurações e métodos do cliente de API.
                    -   `├───storage/`: 🗃️ Utilitários de armazenamento local ou de sessão.
                    -   `└───utils/`: 🔧 Funções de utilidade gerais.
                -   `├───presentation/`: 🖥️ Componentes de UI, páginas, hooks e layouts.
                    -   `├───components/`: 🧱 Componentes de UI reutilizáveis, categorizados por funcionalidade ou tipo.
                        -   `├───admin/`: 🔒 Componentes de UI específicos para administração.
                        -   `├───auth/`: 🔑 Componentes de UI relacionados à autenticação.
                        -   `├───common/`: 🌐 Componentes de UI de uso geral, amplamente utilizados.
                        -   `├───dashboard/`: 📊 Componentes de UI específicos para o dashboard.
                        -   `├───exames/`: 🧪 Componentes de UI para gerenciamento de exames.
                        -   `├───layout/`: 🖼️ Componentes de layout (ex: cabeçalhos, rodapés, barras laterais).
                        -   `└───pacientes/`: 🧑‍🤝‍🧑 Componentes de UI para gerenciamento de pacientes.
                    -   `├───hooks/`: 🎣 Hooks React personalizados para lógica reutilizável.
                    -   `├───layouts/`: 🎨 Define os layouts gerais das páginas.
                    -   `└───pages/`: 📄 Componentes de nível superior que representam diferentes visualizações/páginas.
                -   `└───styles/`: 🎨 Estilos globais, arquivos SASS e temas.
    -   `└───tests/`: 🧪 Contém testes de unidade e integração para os projetos de API e Web.
        -   `├───Api.Tests/`: 🧪 Testes de unidade e integração para a API C# .NET.
        -   `└───Web.Tests/`: 🧪 Testes de unidade e integração para a aplicação web React.