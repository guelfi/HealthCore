# Lista de Validações - Módulo Médicos

## 🎯 Objetivo
Validar o funcionamento completo do CRUD de médicos após a aplicação da migração do banco de dados.

## 📋 Pré-requisitos
- ✅ Migração `AddMedicoEntity` aplicada com sucesso
- ✅ API rodando sem erros
- ✅ Frontend acessível
- ✅ Banco de dados atualizado

## 🔧 Configuração Inicial

### 1. Iniciar a API
```bash
cd src/Api
dotnet run
```
**Porta esperada:** `http://localhost:5000` ou `https://localhost:5001`

### 2. Iniciar o Frontend
```bash
cd src/Web
npm run dev
```
**Porta esperada:** `http://localhost:5173`

### 3. Verificar Conectividade
```bash
# Testar health check da API
curl http://localhost:5000/health

# Testar endpoint de médicos
curl http://localhost:5000/api/medicos
```

## 🧪 Testes da API (Backend)

### ✅ 1. Teste GET - Listar Médicos
```bash
# Requisição
curl -X GET "http://localhost:5000/api/medicos" \
  -H "Content-Type: application/json"

# Resposta esperada (lista vazia inicialmente)
{
  "data": [],
  "totalCount": 0,
  "page": 1,
  "pageSize": 7,
  "totalPages": 0
}
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 2. Teste POST - Criar Médico
```bash
# Requisição
curl -X POST "http://localhost:5000/api/medicos" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Dr. João Silva",
    "documento": "12345678901",
    "crm": "CRM12345SP",
    "especialidade": "Cardiologia",
    "telefone": "(11) 99999-9999",
    "email": "joao.silva@email.com",
    "username": "dr.joao",
    "senha": "senha123"
  }'

# Resposta esperada
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T..."
}
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 3. Teste GET por ID - Buscar Médico
```bash
# Requisição (usar ID do médico criado)
curl -X GET "http://localhost:5000/api/medicos/1" \
  -H "Content-Type: application/json"

# Resposta esperada
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T..."
}
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 4. Teste PUT - Atualizar Médico
```bash
# Requisição
curl -X PUT "http://localhost:5000/api/medicos/1" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Dr. João Silva Santos",
    "documento": "12345678901",
    "crm": "CRM12345SP",
    "especialidade": "Cardiologia Intervencionista",
    "telefone": "(11) 88888-8888",
    "email": "joao.santos@email.com"
  }'

# Resposta esperada
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva Santos",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia Intervencionista",
  "telefone": "(11) 88888-8888",
  "email": "joao.santos@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T..."
}
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 5. Teste DELETE - Excluir Médico
```bash
# Requisição
curl -X DELETE "http://localhost:5000/api/medicos/1" \
  -H "Content-Type: application/json"

# Resposta esperada
Status: 204 No Content
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 6. Teste de Busca com Filtros
```bash
# Busca por nome
curl -X GET "http://localhost:5000/api/medicos?nome=João" \
  -H "Content-Type: application/json"

# Busca por CRM
curl -X GET "http://localhost:5000/api/medicos?crm=CRM12345" \
  -H "Content-Type: application/json"

# Busca por especialidade
curl -X GET "http://localhost:5000/api/medicos?especialidade=Cardiologia" \
  -H "Content-Type: application/json"
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 7. Teste de Validações
```bash
# Teste documento duplicado
curl -X POST "http://localhost:5000/api/medicos" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Dr. Maria",
    "documento": "12345678901",
    "crm": "CRM99999SP",
    "especialidade": "Pediatria",
    "username": "dr.maria",
    "senha": "senha123"
  }'

# Resposta esperada: Erro 400
{
  "error": "Documento já cadastrado"
}

# Teste CRM duplicado
curl -X POST "http://localhost:5000/api/medicos" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Dr. Pedro",
    "documento": "98765432100",
    "crm": "CRM12345SP",
    "especialidade": "Ortopedia",
    "username": "dr.pedro",
    "senha": "senha123"
  }'

# Resposta esperada: Erro 400
{
  "error": "CRM já cadastrado"
}
```
**Status:** [ ] ✅ Passou [ ] ❌ Falhou

## 🖥️ Testes do Frontend

### ✅ 1. Acesso à Página de Médicos
1. Abrir `http://localhost:5173`
2. Fazer login como administrador
3. Navegar para "Médicos" no menu
4. Verificar se a página carrega sem erros

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 2. Listagem de Médicos
1. Verificar se a tabela é exibida
2. Verificar colunas: Nome, CRM, Especialidade, Documento, Status
3. Verificar paginação (7 itens por página)
4. Verificar se dados são carregados da API

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 3. Criação de Médico
1. Clicar no botão "Adicionar Médico"
2. Preencher todos os campos obrigatórios:
   - Nome Completo
   - Documento (CPF)
   - CRM
   - Especialidade
   - Username
   - Senha
3. Clicar em "Salvar"
4. Verificar se o médico aparece na lista

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 4. Edição de Médico
1. Clicar no ícone de edição de um médico
2. Modificar alguns campos
3. Clicar em "Salvar"
4. Verificar se as alterações foram aplicadas

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 5. Exclusão de Médico
1. Clicar no ícone de edição de um médico
2. Clicar no botão "Excluir"
3. Confirmar a exclusão
4. Verificar se o médico foi removido da lista

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 6. Busca e Filtros
1. Usar o campo de busca para procurar por nome
2. Verificar se os resultados são filtrados
3. Testar busca por CRM
4. Testar busca por especialidade

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 7. Validações do Frontend
1. Tentar criar médico com campos obrigatórios vazios
2. Verificar se mensagens de erro são exibidas
3. Tentar criar médico com documento inválido
4. Verificar se validações impedem o envio

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

## 🔗 Testes de Integração

### ✅ 1. Sincronização Frontend-Backend
1. Criar médico no frontend
2. Verificar se aparece imediatamente na lista
3. Atualizar página e verificar persistência
4. Verificar se dados estão corretos no banco

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 2. Relacionamento com Usuários
1. Verificar se usuário é criado junto com médico
2. Verificar se role "Medico" é atribuída
3. Testar login com credenciais do médico
4. Verificar permissões específicas

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

### ✅ 3. Paginação Consistente
1. Criar mais de 7 médicos
2. Verificar se paginação funciona corretamente
3. Navegar entre páginas
4. Verificar contadores de total

**Status:** [ ] ✅ Passou [ ] ❌ Falhou

## 📊 Resumo dos Testes

### Backend (API)
- [ ] GET /api/medicos (Listar)
- [ ] POST /api/medicos (Criar)
- [ ] GET /api/medicos/{id} (Buscar por ID)
- [ ] PUT /api/medicos/{id} (Atualizar)
- [ ] DELETE /api/medicos/{id} (Excluir)
- [ ] Filtros de busca
- [ ] Validações de duplicidade

### Frontend
- [ ] Acesso à página
- [ ] Listagem de médicos
- [ ] Criação de médico
- [ ] Edição de médico
- [ ] Exclusão de médico
- [ ] Busca e filtros
- [ ] Validações de formulário

### Integração
- [ ] Sincronização frontend-backend
- [ ] Relacionamento com usuários
- [ ] Paginação consistente

## ✅ Critérios de Aprovação
Para considerar a implementação completa, **TODOS** os testes devem passar:

- **Backend:** 7/7 testes ✅
- **Frontend:** 7/7 testes ✅
- **Integração:** 3/3 testes ✅

**Total:** 17/17 testes ✅

## 🚨 Em Caso de Falhas
1. Documentar o erro específico
2. Verificar logs da API e do frontend
3. Consultar `TROUBLESHOOTING.md`
4. Revisar configurações do banco de dados
5. Verificar se todas as dependências estão instaladas

## 📝 Relatório Final
Após completar todos os testes, criar um relatório com:
- Status de cada teste
- Problemas encontrados e soluções
- Tempo total de execução
- Recomendações para melhorias

**Data de Execução:** ___________
**Responsável:** ___________
**Status Geral:** [ ] ✅ Aprovado [ ] ❌ Reprovado