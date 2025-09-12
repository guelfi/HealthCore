# Guia de Execução Local do Projeto MobileMed

Este guia detalha os passos necessários para configurar e executar o projeto MobileMed localmente, incluindo a API (backend) e o Frontend (React).

## 1. Visão Geral do Projeto

O MobileMed é uma aplicação para gerenciamento de pacientes e exames, com funcionalidades de cadastro, consulta, atualização e exclusão, além de um sistema de autenticação baseado em JWT.

## 2. Pré-requisitos

Certifique-se de ter o seguinte software instalado em sua máquina:

*   **.NET SDK 8.0 ou superior**: Para o desenvolvimento e execução da API.
    *   [Download .NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   **Node.js (LTS recomendado) e npm**: Para o desenvolvimento e execução do Frontend.
    *   [Download Node.js](https://nodejs.org/en/download/)
*   **Git**: Para clonar o repositório.
    *   [Download Git](https://git-scm.com/downloads)
*   **cURL**: Ferramenta de linha de comando para testar a API (geralmente pré-instalado em sistemas Unix-like).
    *   [Download cURL](https://curl.se/download.html)
*   **jq**: Processador JSON de linha de comando (usado nos scripts de teste cURL para parsing de JSON).
    *   [Download jq](https://stedolan.github.io/jq/download/)
*   **Postman (Opcional)**: Para testar a API usando a coleção e ambiente fornecidos.
    *   [Download Postman](https://www.postman.com/downloads/)

## 3. Configuração Inicial do Projeto

1.  **Clone o Repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd HealthCore
    ```
    *(Substitua `<URL_DO_REPOSITORIO>` pelo URL real do seu repositório Git.)*

2.  **Navegue para a Raiz do Projeto:**
    Certifique-se de que seu terminal esteja no diretório `HealthCore` (a raiz do projeto). Todos os comandos subsequentes devem ser executados a partir deste diretório.

## 4. Configuração e Execução da API (Backend)

A API é desenvolvida em .NET 8 e utiliza SQLite como banco de dados.

1.  **Navegue para o Diretório da API:**
    ```bash
    cd src/Api
    ```

2.  **Restaure as Dependências:**
    ```bash
    dotnet restore
    ```

3.  **Aplique as Migrações do Banco de Dados:**
    Certifique-se de que o banco de dados SQLite (`mobilemed.db`) seja criado e as tabelas sejam configuradas.
    ```bash
    dotnet ef database update
    ```
    *(Se você tiver problemas com `dotnet ef`, certifique-se de ter a ferramenta `dotnet-ef` instalada globalmente: `dotnet tool install --global dotnet-ef`)*

4.  **Volte para a Raiz do Projeto:**
    ```bash
    cd ../..
    ```

5.  **Inicie o Servidor da API:**
    Utilize o script de gerenciamento `server.sh` (macOS/Linux) ou `server.bat`/`server.ps1` (Windows).

    *   **macOS/Linux:**
        ```bash
        ./scripts/server.sh start
        ```
    *   **Windows (Prompt de Comando/CMD):**
        ```cmd
        scripts\server.bat start
        ```
    *   **Windows (PowerShell):**
        ```powershell
        .\scripts\server.ps1 -Command start
        ```
    A API será iniciada em `http://localhost:5000` (ou outra porta configurada).

6.  **Acesse a Documentação da API (Swagger UI):**
    Com a API em execução, você pode acessar a documentação interativa em:
    `http://localhost:5000/swagger`

## 5. Configuração e Execução do Frontend (React)

*(**Nota**: O frontend ainda não foi implementado neste projeto. As instruções abaixo são um placeholder para quando ele for desenvolvido.)*

1.  **Navegue para o Diretório do Frontend:**
    ```bash
    cd src/Web
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    # ou yarn install
    ```

3.  **Inicie o Servidor de Desenvolvimento do Frontend:**
    ```bash
    npm run dev
    # ou yarn dev
    ```
    O frontend será iniciado em `http://localhost:3000` (ou outra porta configurada).

## 6. Testando a API

Você pode testar a API usando os scripts cURL fornecidos ou importando a coleção Postman.

### 6.1. Testes com cURL

Certifique-se de que a API esteja em execução. Execute o script de teste cURL a partir da **raiz do projeto**:

*   **macOS/Linux:**
    ```bash
    ./scripts/test-api.sh
    ```
*   **Windows (Prompt de Comando/CMD):**
    ```cmd
    scripts\test-api.bat
    ```
*   **Windows (PowerShell):**
    ```powershell
    .\scripts\test-api.ps1
    ```
    Este script registrará um usuário, fará login para obter um token JWT, e então executará testes para as operações de pacientes e exames (criar, listar, atualizar, excluir) usando o token.

### 6.2. Testes com Postman

1.  **Importe a Coleção e o Ambiente:**
    *   Abra o Postman.
    *   Clique em `File > Import` e selecione os arquivos `postman/MobileMed_Collection.json` e `postman/MobileMed_Environment.json` do seu repositório clonado.
2.  **Selecione o Ambiente:**
    No canto superior direito do Postman, selecione "MobileMed Environment".
3.  **Execute as Requisições:**
    A coleção "MobileMed API" contém pastas para "Authentication", "Pacientes" e "Exames".
    *   Comece executando as requisições em "Authentication" para registrar um usuário e obter um `auth_token`. O token será automaticamente salvo no ambiente.
    *   Em seguida, execute as requisições nas pastas "Pacientes" e "Exames". Elas usarão o `auth_token` salvo para autenticar as requisições.

### 6.3. Geração de Relatório de Testes de QA

Para gerar um relatório detalhado dos testes da API em formato Markdown, siga os passos abaixo:

1.  **Pré-requisitos:**
    *   **Python 3 (3.6 ou superior)**: Certifique-se de ter o Python 3 instalado e acessível via comando `python3`.
    *   **pip**: O gerenciador de pacotes do Python (geralmente vem com o Python 3).
    *   **requests**: Biblioteca Python para requisições HTTP. Instale-a se ainda não tiver:
        ```bash
        pip install requests
        ```
    *   **jq**: Processador JSON de linha de comando (já listado nos pré-requisitos gerais).

2.  **Certifique-se de que a API esteja em execução.**

3.  **Execute o script de geração de relatório** a partir da **raiz do projeto**:

    *   **macOS/Linux:**
        ```bash
        python3 scripts/testreport.py
        ```
    *   **Windows (Prompt de Comando/CMD):**
        ```cmd
        python scripts\testreport.py
        ```
    *   **Windows (PowerShell):**
        ```powershell
        python scripts\testreport.py
        ```

    Este script executará todos os testes da API e gerará um arquivo Markdown (`REPORT_DDMMYY_HHMM.md`) na pasta `reports/`, contendo os detalhes de cada teste, comandos executados, respostas JSON e status (✅ SUCESSO, ❌ FALHA, ⚠️ SUCESSO (Erro esperado)).

## 7. Funcionalidades Implementadas na API


A API MobileMed oferece os seguintes recursos:

*   **Gerenciamento de Pacientes:**
    *   `POST /pacientes`: Cadastra um novo paciente.
    *   `GET /pacientes`: Lista pacientes com paginação.
    *   `PUT /pacientes/{id}`: Atualiza dados de um paciente existente.
    *   `DELETE /pacientes/{id}`: Exclui um paciente.
*   **Gerenciamento de Exames:**
    *   `POST /exames`: Cadastra um novo exame para um paciente, com controle de idempotência.
    *   `GET /exames`: Lista exames com paginação.
    *   `PUT /exames/{id}`: Atualiza dados de um exame existente.
    *   `DELETE /exames/{id}`: Exclui um exame.
*   **Autenticação e Autorização:**
    *   `POST /auth/register`: Registra um novo usuário.
    *   `POST /auth/login`: Autentica um usuário e retorna um token JWT.
    *   Endpoints de pacientes e exames são protegidos por autenticação JWT.

## 8. Parando o Servidor da API

Para parar o servidor da API, execute o seguinte comando a partir da **raiz do projeto**:

*   **macOS/Linux:**
    ```bash
    ./scripts/server.sh stop
    ```
*   **Windows (Prompt de Comando/CMD):**
    ```cmd
    scripts\server.bat stop
    ```
*   **Windows (PowerShell):**
    ```powershell
    .\scripts\server.ps1 -Command stop
    ```
