# Lista de Tarefas - HealthCore

## 1. Requisitos Funcionais

### 1.1. Cadastro de Pacientes e Exames

- [x] **US01: Cadastro de Pacientes** - Registrar pacientes com nome, data de nascimento e documento (único)
- [x] **US02: Consulta de Pacientes** - Consultar pacientes de forma paginada
- [x] **US07: Atualização de Pacientes** - Atualizar dados de pacientes existentes
- [x] **US08: Exclusão de Pacientes** - Excluir pacientes do sistema
- [x] **US03: Cadastro de Exames** - Registrar exames para um paciente existente, informando a modalidade DICOM e uma `idempotencyKey`
- [x] **US04: Consulta de Exames** - Consultar exames de forma paginada
- [x] **US09: Atualização de Exames** - Atualizar resultados de exames existentes
- [x] **US10: Exclusão de Exames** - Excluir exames do sistema
- [x] **US05: Idempotência no Cadastro de Exames** - Garantir que requisições de exames duplicadas não criem múltiplos registros
- [x] **US06: Tratamento de Concorrência** - Lidar com requisições concorrentes para criação de exames com a mesma `idempotencyKey`

### 1.2. Autenticação e Autorização

- [x] **AUTH01: Sistema de Login** - Implementar endpoint de login para usuários (geração de JWT)
- [x] **AUTH02: Proteção de Endpoints** - Proteger endpoints da API com autenticação JWT
- [ ] **AUTH03: Controle de Acesso** - Implementar controle de acesso baseado em perfis (se aplicável, *requer definição de perfis e lógica de autorização granular*)

### 1.3. Frontend (React + Vite)

- [ ] **UI01: Listagem Paginada** - Implementar componentes para listar pacientes e exames com paginação
- [ ] **UI02: Formulários de Cadastro** - Criar formulários para cadastro de pacientes e exames
- [ ] **UI03: Feedback ao Usuário** - Exibir mensagens de erro, sucesso e loading de forma clara
- [ ] **UI04: Validação de Formulários** - Validar campos obrigatórios e formatos de dados no frontend
- [ ] **UI05: Tratamento de Erros de Rede** - Exibir mensagem de erro com opção de "Tentar novamente" em caso de falha de comunicação com a API
- [ ] **UI06: Gerenciamento de Autenticação** - Implementar fluxo de login/logout, armazenamento e envio do token JWT no frontend
- [ ] **UI07: Tratamento de Acesso Não Autorizado** - Redirecionar usuários não autenticados/autorizados e exibir mensagens apropriadas

## 2. Requisitos Não Funcionais

### 2.1. Segurança

- [x] **SEC01: Autenticação** - Utilizar JWT para autenticação nas APIs

### 2.2. Performance

- [x] **PERF01: Paginação** - Todas as listagens de dados devem ser paginadas para otimizar o carregamento

### 2.3. Testabilidade

- [x] **TEST01: Cobertura de Testes** - Exigir cobertura mínima de 80% para testes unitários e de integração no backend
- [ ] **TEST02: Testes de Frontend** - Implementar testes unitários (Vitest/Jest) para o frontend
- [x] **TEST03: Testes de Integração** - Testar o fluxo completo de criação de paciente e exame, validações de negócio e idempotência

### 2.4. Logging

- [x] **LOG01: Implementação de Logging** - Implementar um sistema de logging robusto no back-end, seguindo os princípios SOLID.

## 3. Bônus para Diferenciação Técnica

- [ ] 🐳 **Uso de Docker** - Arquivo `docker-compose.yml` com banco e backend
- [x] 📜 **Integracão com Swagger / OpenAPI** - Documentação dos endpoints RESTful disponível via `/api/docs`
- [ ] ⚙️ **Pipeline CI Básico com GitHub Actions** - Rodar testes automatizados e validar lint ou build
- [ ] 📚 **Documentação Técnica** - `README.md` com instruções para rodar o projeto localmente

## 3.1. Melhorias e Refatorações Recentes

- [x] **REF01: Refatorar test-api.sh** - Alterar o script para executar testes unitários e gerar relatório detalhado em Markdown.
- [x] **REF02: Aprimorar server.sh** - Melhorar a apresentação do script de gerenciamento (start/stop/status) com iconografia e informações de rede.
- [x] **REF03: Localizar Mensagens da API** - Traduzir mensagens de resposta da API para português.
- [ ] **REF04: Localizar Mensagens testreport.py** - Revisar e traduzir todas as mensagens do script testreport.py para português.
- [ ] **REF05: Corrigir erro final em server.sh** - Resolver o erro 'echo Compilação: No such file or directory' na saída do script server.sh.
- [ ] **REF06: Implementar scripts server.bat/ps1** - Garantir que os scripts de gerenciamento para Windows estejam atualizados e funcionais.
- [ ] **REF07: Revisão Abrangente de Localização da API** - Realizar uma revisão completa de todas as strings da API para garantir que todas as mensagens voltadas para o usuário estejam em português.

## 4. Configuração do Banco de Dados

- [x] **DB01: Criação das Migrations** - Criar migrations do Entity Framework Core
- [x] **DB02: Aplicação das Migrations** - Aplicar migrations para criar o banco de dados

## 5. Scripts de Gerenciamento

- [x] **SCRIPT01: Scripts de Inicialização** - Criar script `server.sh` para start, stop e status para macOS/Linux
- [ ] **SCRIPT02: Scripts de Inicialização** - Criar scripts `server.bat` e `server.ps1` para start, stop e status para Windows

## 6. Testes da API

- [x] **TESTAPI01: Scripts de Teste com cURL** - Criar scripts para testar a API usando cURL
- [x] **TESTAPI02: Configuração do Postman** - Criar arquivos de environment e collection na pasta postman
- [x] **TESTAPI03: Pre-requests Scripts** - Criar scripts de Pre-request para validar parâmetros
- [x] **TESTAPI04: Post-response Scripts** - Criar scripts de Post-response para analisar retornos

## 7. Requisitos de Arquitetura

### 7.1. Stack de Tecnologia

- [x] **Backend:** .NET 8, ASP.NET Core
- [x] **Banco de Dados:** SQLite (configurado e criado)
- [x] **ORM:** Entity Framework Core
- [ ] **Frontend:** React com Vite
- [ ] **Estilização:** Material Design

### 7.2. Padrões de Arquitetura

- [x] **Clean Architecture** - Separar as camadas de Domínio, Aplicação, Infraestrutura e Apresentação
- [x] **Domain-Driven Design (DDD)** - Modelar o domínio em torno de agregados como `Paciente` e `Exame`
- [x] **Repository Pattern** - Abstrair o acesso a dados (implementado através do Entity Framework Core e migrations)
- [x] **RESTful APIs** - Seguir os princípios REST para a construção dos endpoints

### 7.3. Princípios de Design

- [x] **SOLID** - Aplicar os princípios SOLID no design do código
- [x] **Clean Code** - Escrever código limpo, legível e de fácil manutenção
- [ ] **TDD** - Desenvolver orientado a testes (aplicado em parte, mas não de forma rigorosa em todo o projeto)
