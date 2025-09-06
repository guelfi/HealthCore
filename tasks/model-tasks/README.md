# 📋 Sistema de Controle de Tarefas - Template

## 📁 Estrutura de Arquivos Template

Esta pasta serve como modelo para criação de novas tarefas de implementação no projeto MobileMed.

### 🎯 Como Usar Este Template

1. **Copie esta pasta** para uma nova pasta com nome descritivo:
   ```
   cp -r model-tasks/ XX-NomeDaFuncionalidade/
   ```

2. **Renomeie os arquivos** conforme necessário:
   - `template_session_001.json` → `{funcionalidade}_session_001.json`
   - Scripts PowerShell/Python conforme a funcionalidade

3. **Edite os arquivos** com as informações específicas da sua implementação

### 📄 Arquivos de Sessão

Cada sessão de trabalho gera um arquivo JSON com o formato:
- `{tipo_sessao}_{numero_sessao}.json`

**Exemplo**: `integration_session_001.json`, `feature_session_001.json`

### 🏗️ Estrutura do Arquivo JSON

```json
{
  "session_info": {
    "session_id": "identificador_unico",
    "created_at": "timestamp_criacao",
    "last_updated": "timestamp_ultima_atualizacao",
    "description": "descrição_da_sessao",
    "api_endpoint": "endpoint_da_api",
    "frontend_port": "porta_frontend"
  },
  "tasks": [
    {
      "id": "identificador_tarefa",
      "content": "descrição_da_tarefa",
      "status": "PENDING|IN_PROGRESS|COMPLETE|ERROR|CANCELLED",
      "started_at": "timestamp_inicio",
      "completed_at": "timestamp_conclusao",
      "notes": "observações_importantes"
    }
  ],
  "progress_summary": {
    "total_tasks": 0,
    "completed": 0,
    "in_progress": 0,
    "pending": 0,
    "completion_percentage": 0
  },
  "files_modified": [
    "lista_de_arquivos_modificados"
  ],
  "next_session_priorities": [
    "prioridades_para_próxima_sessão"
  ]
}
```

### 📊 Status de Tarefas

- **PENDING**: Tarefa não iniciada
- **IN_PROGRESS**: Tarefa em andamento
- **COMPLETE**: Tarefa concluída
- **ERROR**: Tarefa com erro
- **CANCELLED**: Tarefa cancelada

### 🛠️ Scripts Disponíveis

#### PowerShell (Windows)
- `view_session_status.ps1`: Visualizar progresso da sessão
- `update_task_status.ps1`: Atualizar status de tarefas

#### Python (Cross-platform)
- `view_session_status.py`: Visualizar progresso da sessão
- `update_task_status.py`: Atualizar status de tarefas

### 📝 Documentação

- **README.md**: Este arquivo com instruções
- **IMPLEMENTACAO_[NOME].md**: Documentação detalhada da implementação

### 🎨 Boas Práticas

1. **Nomeação Consistente**: Use prefixos numerados (01-, 02-, etc.)
2. **Documentação Completa**: Sempre documente o que foi implementado
3. **Status Atualizados**: Mantenha os status das tarefas sempre atualizados
4. **Backup de Sessões**: Mantenha histórico das sessões anteriores
5. **Prioridades Claras**: Defina prioridades para próximas sessões

### 🔄 Fluxo de Trabalho

1. Criar nova pasta baseada neste template
2. Definir tarefas no arquivo JSON
3. Executar implementação
4. Atualizar status das tarefas
5. Documentar resultados
6. Definir próximos passos

### 📋 Checklist de Implementação

- [ ] Pasta criada com nome descritivo
- [ ] Arquivos renomeados adequadamente
- [ ] Tarefas definidas no JSON
- [ ] Implementação executada
- [ ] Status atualizados
- [ ] Documentação completa
- [ ] Próximos passos definidos

---

**Nota**: Este template foi criado baseado no padrão estabelecido nas implementações anteriores do projeto MobileMed.