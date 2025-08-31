# Documentação dos Endpoints - API Médicos

## 🎯 Visão Geral
Documentação completa dos endpoints REST para o módulo de médicos da API MobileMed.

**Base URL:** `http://localhost:5000/api/medicos`

## 📋 Estrutura da Entidade Médico

### Modelo de Dados
```json
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T10:30:00Z"
}
```

### Campos Obrigatórios
- `nomeCompleto` (string, max 200)
- `documento` (string, 11 dígitos, único)
- `crm` (string, max 20, único)
- `especialidade` (string, max 100)
- `username` (string, único - apenas na criação)
- `senha` (string, min 6 - apenas na criação)

### Campos Opcionais
- `telefone` (string, max 20)
- `email` (string, max 100)

## 🔗 Endpoints Disponíveis

### 1. Listar Médicos
**GET** `/api/medicos`

#### Parâmetros de Query
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------|
| `page` | int | Não | Número da página (padrão: 1) |
| `pageSize` | int | Não | Itens por página (padrão: 7) |
| `nome` | string | Não | Filtro por nome (busca parcial) |
| `crm` | string | Não | Filtro por CRM (busca parcial) |
| `especialidade` | string | Não | Filtro por especialidade (busca parcial) |

#### Exemplo de Requisição
```bash
curl -X GET "http://localhost:5000/api/medicos?page=1&pageSize=7&nome=João" \
  -H "Content-Type: application/json"
```

#### Resposta de Sucesso (200)
```json
{
  "data": [
    {
      "id": 1,
      "nomeCompleto": "Dr. João Silva",
      "documento": "12345678901",
      "crm": "CRM12345SP",
      "especialidade": "Cardiologia",
      "telefone": "(11) 99999-9999",
      "email": "joao.silva@email.com",
      "ativo": true,
      "dataCriacao": "2025-01-31T10:30:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 7,
  "totalPages": 1
}
```

---

### 2. Buscar Médico por ID
**GET** `/api/medicos/{id}`

#### Parâmetros de Rota
| Parâmetro | Tipo | Descrição |
|-----------|------|------------|
| `id` | int | ID único do médico |

#### Exemplo de Requisição
```bash
curl -X GET "http://localhost:5000/api/medicos/1" \
  -H "Content-Type: application/json"
```

#### Resposta de Sucesso (200)
```json
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T10:30:00Z"
}
```

#### Resposta de Erro (404)
```json
{
  "error": "Médico não encontrado"
}
```

---

### 3. Criar Médico
**POST** `/api/medicos`

#### Corpo da Requisição
```json
{
  "nomeCompleto": "Dr. João Silva",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@email.com",
  "username": "dr.joao",
  "senha": "senha123"
}
```

#### Exemplo de Requisição
```bash
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
```

#### Resposta de Sucesso (201)
```json
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T10:30:00Z"
}
```

#### Respostas de Erro

**400 - Documento Duplicado**
```json
{
  "error": "Documento já cadastrado"
}
```

**400 - CRM Duplicado**
```json
{
  "error": "CRM já cadastrado"
}
```

**400 - Username Duplicado**
```json
{
  "error": "Username já cadastrado"
}
```

**400 - Validação**
```json
{
  "error": "Dados inválidos",
  "details": {
    "nomeCompleto": "Nome completo é obrigatório",
    "documento": "Documento deve ter 11 dígitos",
    "crm": "CRM é obrigatório"
  }
}
```

---

### 4. Atualizar Médico
**PUT** `/api/medicos/{id}`

#### Parâmetros de Rota
| Parâmetro | Tipo | Descrição |
|-----------|------|------------|
| `id` | int | ID único do médico |

#### Corpo da Requisição
```json
{
  "nomeCompleto": "Dr. João Silva Santos",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia Intervencionista",
  "telefone": "(11) 88888-8888",
  "email": "joao.santos@email.com"
}
```

#### Exemplo de Requisição
```bash
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
```

#### Resposta de Sucesso (200)
```json
{
  "id": 1,
  "nomeCompleto": "Dr. João Silva Santos",
  "documento": "12345678901",
  "crm": "CRM12345SP",
  "especialidade": "Cardiologia Intervencionista",
  "telefone": "(11) 88888-8888",
  "email": "joao.santos@email.com",
  "ativo": true,
  "dataCriacao": "2025-01-31T10:30:00Z"
}
```

#### Resposta de Erro (404)
```json
{
  "error": "Médico não encontrado"
}
```

---

### 5. Excluir Médico
**DELETE** `/api/medicos/{id}`

#### Parâmetros de Rota
| Parâmetro | Tipo | Descrição |
|-----------|------|------------|
| `id` | int | ID único do médico |

#### Exemplo de Requisição
```bash
curl -X DELETE "http://localhost:5000/api/medicos/1" \
  -H "Content-Type: application/json"
```

#### Resposta de Sucesso (204)
```
No Content
```

#### Resposta de Erro (404)
```json
{
  "error": "Médico não encontrado"
}
```

## 🔍 Exemplos de Filtros

### Busca por Nome
```bash
curl -X GET "http://localhost:5000/api/medicos?nome=João" \
  -H "Content-Type: application/json"
```

### Busca por CRM
```bash
curl -X GET "http://localhost:5000/api/medicos?crm=CRM12345" \
  -H "Content-Type: application/json"
```

### Busca por Especialidade
```bash
curl -X GET "http://localhost:5000/api/medicos?especialidade=Cardiologia" \
  -H "Content-Type: application/json"
```

### Busca Combinada com Paginação
```bash
curl -X GET "http://localhost:5000/api/medicos?nome=Silva&especialidade=Cardiologia&page=1&pageSize=5" \
  -H "Content-Type: application/json"
```

## 🔒 Autenticação e Autorização

### Headers Necessários
```bash
# Para endpoints protegidos (se implementado)
-H "Authorization: Bearer {token}"
-H "Content-Type: application/json"
```

### Roles Necessárias
- **Admin**: Acesso completo (CRUD)
- **Medico**: Acesso de leitura aos próprios dados
- **Recepcionista**: Acesso de leitura

## 📊 Códigos de Status HTTP

| Código | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| 200 | OK | Operação bem-sucedida (GET, PUT) |
| 201 | Created | Médico criado com sucesso (POST) |
| 204 | No Content | Médico excluído com sucesso (DELETE) |
| 400 | Bad Request | Dados inválidos ou duplicados |
| 401 | Unauthorized | Token inválido ou ausente |
| 403 | Forbidden | Sem permissão para a operação |
| 404 | Not Found | Médico não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

## 🧪 Testes com Postman

### Coleção de Testes
Importe a coleção `MobileMed_Collection.json` no Postman para testes automatizados.

### Variáveis de Ambiente
```json
{
  "api_base_url": "http://localhost:5000",
  "medico_id": "1",
  "auth_token": "seu_token_aqui"
}
```

## 📝 Notas de Implementação

### Validações Implementadas
- **Documento**: Único, 11 dígitos numéricos
- **CRM**: Único, máximo 20 caracteres
- **Username**: Único, criado automaticamente se não fornecido
- **Email**: Formato válido (se fornecido)
- **Telefone**: Formato brasileiro (se fornecido)

### Relacionamentos
- **User**: Criado automaticamente com role "Medico"
- **Exames**: Relacionamento 1:N (um médico pode ter vários exames)

### Paginação Padrão
- **Página**: 1
- **Itens por página**: 7
- **Ordenação**: Por data de criação (mais recente primeiro)

### Soft Delete
- Médicos são marcados como `ativo: false` em vez de serem excluídos fisicamente
- Filtros automáticos mostram apenas médicos ativos por padrão

## 🔄 Versionamento
- **Versão atual**: v1
- **Compatibilidade**: Mantida para versões anteriores
- **Mudanças**: Documentadas no changelog da API