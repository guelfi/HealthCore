# 📋 Instruções de Uso do Template de Tarefas

## 🎯 Objetivo

Este template fornece uma estrutura padronizada para gerenciar implementações e funcionalidades no projeto HealthCore, permitindo:

- ✅ Controle de progresso de tarefas
- 📊 Visualização de status em tempo real
- 📝 Documentação automática do processo
- 🔄 Continuidade entre sessões de trabalho

## 🚀 Como Usar

### 1. **Criar Nova Implementação**

```bash
# Copiar o template para uma nova pasta
cp -r model-tasks/ 08-NovaFuncionalidade/

# Ou no Windows
xcopy model-tasks 08-NovaFuncionalidade\ /E /I
```

### 2. **Personalizar os Arquivos**

#### **a) Renomear arquivo JSON**
```bash
# Renomear o arquivo de sessão
mv template_session_001.json nova_funcionalidade_session_001.json
```

#### **b) Atualizar scripts**
Editar os arquivos `.ps1` e `.py` para apontar para o novo arquivo JSON:

```powershell
# Em update_task_status.ps1 e view_session_status.ps1
$SessionFile = "nova_funcionalidade_session_001.json"
```

```python
# Em update_task_status.py e view_session_status.py
SESSION_FILE = "nova_funcionalidade_session_001.json"
```

#### **c) Configurar arquivo JSON**
Editar o arquivo JSON com as informações da sua implementação:

```json
{
  "session_info": {
    "session_id": "nova_funcionalidade_001",
    "description": "Implementação da nova funcionalidade X",
    "api_endpoint": "http://localhost:5000",
    "frontend_port": "5005"
  },
  "tasks": [
    {
      "id": "setup_backend",
      "content": "Configurar endpoints da API para funcionalidade X",
      "status": "PENDING"
    },
    {
      "id": "create_frontend",
      "content": "Criar componentes React para funcionalidade X",
      "status": "PENDING"
    }
  ]
}
```

### 3. **Gerenciar Tarefas**

#### **Visualizar Status**
```bash
# PowerShell (Windows)
.\view_session_status.ps1

# Python (Cross-platform)
python view_session_status.py
```

#### **Atualizar Status de Tarefa**
```bash
# PowerShell
.\update_task_status.ps1 -TaskId "setup_backend" -Status "IN_PROGRESS" -Notes "Iniciando configuração"

# Python
python update_task_status.py --task-id "setup_backend" --status "IN_PROGRESS" --notes "Iniciando configuração"
```

### 4. **Documentar Implementação**

Editar o arquivo `IMPLEMENTACAO_TEMPLATE.md` com:
- ✅ Funcionalidades implementadas
- 🔧 Detalhes técnicos
- 🧪 Testes realizados
- 🐛 Problemas encontrados
- 📝 Observações importantes

## 📊 Status de Tarefas

| Status | Descrição | Ícone |
|--------|-----------|-------|
| `PENDING` | Tarefa não iniciada | ⏳ |
| `IN_PROGRESS` | Tarefa em andamento | 🔄 |
| `COMPLETE` | Tarefa concluída | ✅ |
| `ERROR` | Tarefa com erro | ❌ |
| `CANCELLED` | Tarefa cancelada | 🚫 |

## 🛠️ Ferramentas Disponíveis

### **Scripts PowerShell (Windows)**
- `view_session_status.ps1` - Visualização colorida do progresso
- `update_task_status.ps1` - Atualização de status com validação

### **Scripts Python (Cross-platform)**
- `view_session_status.py` - Visualização com cores ANSI
- `update_task_status.py` - Atualização com argumentos de linha de comando

## 📝 Exemplos Práticos

### **Exemplo 1: Nova Feature de Relatórios**
```bash
# 1. Criar pasta
cp -r model-tasks/ 08-RelatoriosAvancados/

# 2. Renomear arquivo
mv template_session_001.json relatorios_session_001.json

# 3. Atualizar scripts
# Editar SESSION_FILE nos scripts

# 4. Definir tarefas no JSON
# Editar relatorios_session_001.json

# 5. Iniciar implementação
python update_task_status.py --task-id "create_report_api" --status "IN_PROGRESS"
```

### **Exemplo 2: Integração com Serviço Externo**
```bash
# 1. Criar pasta
cp -r model-tasks/ 09-IntegracaoWhatsApp/

# 2. Configurar arquivos
# Renomear e editar conforme necessário

# 3. Acompanhar progresso
python view_session_status.py
```

## 🎨 Boas Práticas

### **Nomeação**
- Use prefixos numerados: `01-`, `02-`, etc.
- Nomes descritivos: `08-RelatoriosAvancados`
- IDs de tarefas claros: `create_api_endpoint`, `test_integration`

### **Documentação**
- Mantenha o README.md atualizado
- Documente problemas e soluções
- Registre arquivos modificados
- Defina próximos passos claramente

### **Controle de Versão**
- Commit após cada tarefa concluída
- Use mensagens descritivas
- Mantenha histórico das sessões

### **Organização**
- Uma pasta por funcionalidade/implementação
- Arquivos JSON versionados (001, 002, etc.)
- Scripts sempre atualizados

## 🔍 Troubleshooting

### **Erro: Arquivo não encontrado**
```bash
# Verificar se o arquivo JSON existe
ls -la *.json

# Verificar nome do arquivo nos scripts
grep "SESSION_FILE" *.py *.ps1
```

### **Erro: Tarefa não encontrada**
```bash
# Listar tarefas disponíveis
python view_session_status.py

# Verificar IDs no arquivo JSON
cat *.json | grep '"id"'
```

### **Erro: Status inválido**
```bash
# Status válidos: PENDING, IN_PROGRESS, COMPLETE, ERROR, CANCELLED
python update_task_status.py --task-id "exemplo" --status "COMPLETE"
```

## 📚 Referências

- [Documentação do Projeto](../docs/)
- [Guia de Contribuição](../docs/contributing.md)
- [Estrutura do Projeto](../docs/structure.md)

---

**💡 Dica**: Mantenha este template sempre atualizado com melhorias e novos padrões identificados durante o desenvolvimento.