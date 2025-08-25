📝 **Task: Cadastro de Pacientes e Exames Médicos com Modalidades DICOM - MobileMed**

🎯 **Descrição**

Como usuário da plataforma médica,  
Quero registrar e consultar pacientes e seus exames de forma segura, consistente e com boa experiência de navegação,  
Para que eu tenha controle sobre o histórico clínico mesmo em situações de reenvio de requisição ou acessos simultâneos.

🔧 **Escopo da Task**

-   Implementar API REST em netcore 8 para cadastro e consulta de pacientes e exames.
-   Garantir idempotência no cadastro de exames.
-   Criar estrutura segura para suportar requisições concorrentes.
-   Implementar paginação para consultas.
-   Integrar com front-end React + Vite.
-   Criar componentes React + Vite para cadastro e listagem de pacientes e exames.
-   Utilizar práticas RESTful, transações ACID e código modular.

✅ **Regras de Validações**

-   O `documento` do paciente deve ser único.
-   A `idempotencyKey` do exame deve garantir que requisições duplicadas não criem múltiplos registros.
-   Não é permitido cadastrar exame para paciente inexistente.
-   Campos obrigatórios devem ser validados (nome, data de nascimento, modalidade, etc).

📦 **Saída Esperada**

-   Endpoints criados:
    -   `POST /pacientes`
    -   `GET /pacientes?page=x&pageSize=y`
    -   `POST /exames`
    -   `GET /exames?page=x&pageSize=y`
-   Dados persistidos de forma segura e idempotente.
-   Front-end com:
    -   Listagem paginada de pacientes e exames.
    -   Cadastro funcional via formulários.
    -   UI amigável com mensagens de erro e loading.

🔥 **Critérios de Aceite**

-   **Dado** que um paciente válido foi cadastrado,  
    **Quando** for enviado um novo exame com `idempotencyKey` única,  
    **Então** o exame deverá ser criado com sucesso.
    
-   **Dado** que um exame com `idempotencyKey` já existe,  
    **Quando** for enviada uma nova requisição com os mesmos dados,  
    **Então** o sistema deverá retornar HTTP 200 com o mesmo exame, sem recriá-lo.
    
-   **Dado** que múltiplas requisições simultâneas com mesma `idempotencyKey` são feitas,  
    **Quando** processadas,  
    **Então** apenas um exame deverá ser persistido.
    
-   **Dado** que o front-end está carregando dados,  
    **Quando** houver erro de rede,  
    **Então** deve ser exibida mensagem de erro com botão "Tentar novamente".

👥 **Dependências**

-   Banco de dados com suporte a transações (SQLite).
-   Integração REST entre backend (.netcore 8) e frontend (React + Vite).
-   Validação de campos no front-end e back-end.
-   Definição do enum de modalidades DICOM:
    -   `CR, CT, DX, MG, MR, NM, OT, PT, RF, US, XA`

🧪 **Cenários de Teste**

Cenário

Descrição

Resultado Esperado

1

Criar paciente com dados válidos

Paciente salvo com UUID único

2

Criar paciente com CPF já existente

Erro de validação 409 - duplicidade

3

Criar exame com paciente existente e idempotencyKey nova

HTTP 201 e exame salvo

4

Reenviar exame com mesma idempotencyKey

HTTP 200 e retorno do mesmo exame

5

Enviar múltiplas requisições simultâneas com mesma idempotencyKey

Apenas um exame persistido

6

Criar exame com paciente inexistente

Erro 400 - paciente não encontrado

7

Listar exames com paginação (10 por página)

Retorno paginado corretamente

8

Listar pacientes com paginação

Lista retornada corretamente

9

Frontend mostra loading durante chamada

Spinner visível enquanto carrega

10

Frontend exibe erro de rede e botão “Tentar novamente”

Mensagem visível e reenvio possível

11

Enviar exame com modalidade inválida

Erro 400 - enum inválido

12

Validação visual dos campos obrigatórios no formulário

Campos com feedback de erro

13

Cobertura mínima de 80% nos testes unitários e integração

Relatório de cobertura válido

⸻

🧪 **Testes de Integração (Requisito Obrigatório)**

-   Devem ser implementados utilizando ferramentas como:
    -   xUnit.net, NUnit,  MSTes (backend)
    -   Vitest, **Jest** (frontend React + Vite)
-   Devem cobrir pelo menos:
    -   Fluxo de criação completo (Paciente → Exame)
    -   Validações de regra de negócio
    -   Idempotência em requisições simultâneas
    -   Respostas corretas de erro
    -   Listagem paginada

⸻

✨ **Bônus para Diferenciação Técnica**

Os itens a seguir não são obrigatórios, mas serão **altamente valorizados**:

-   🐳 **Uso de Docker** para orquestração local:
    -   Arquivo `docker-compose.yml` com banco e backend
    -   Script de inicialização da aplicação
-   📜 **Integração com Swagger / OpenAPI**:
    -   Documentação dos endpoints RESTful
    -   Disponível via `/api/docs` ou equivalente
-   ⚙️ **Pipeline CI Básico com GitHub Actions**:
    -   Rodar testes automatizados
    -   Validar lint ou build
-   📚 **Documentação Técnica**:
    -   `README.md` com instruções para rodar o projeto localmente
    -   Scripts de setup e uso da API
    -   Seções com decisões de arquitetura