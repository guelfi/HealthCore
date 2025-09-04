# Guia de Contribuição

## Padrões de Commit

Este projeto utiliza mensagens de commit em **português brasileiro** seguindo convenções padronizadas.

### Configuração Inicial

Para configurar seu ambiente local:

```bash
# Configure o template de commit (já configurado no projeto)
git config commit.template .gitmessage

# Configure seu nome e email (substitua pelos seus dados)
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"
```

### Formato das Mensagens de Commit

#### Estrutura Básica
```
tipo: Descrição concisa da alteração (máximo 50 caracteres)

Descrição detalhada do que foi alterado e por quê.
Use o corpo para explicar o contexto e motivação.

Closes #123
```

#### Tipos de Commit

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações na documentação
- **style**: Formatação, espaços, etc. (sem mudança de lógica)
- **refactor**: Refatoração de código (sem nova funcionalidade ou correção)
- **test**: Adição ou modificação de testes
- **chore**: Tarefas de manutenção, configuração, dependências
- **perf**: Melhoria de performance
- **ci**: Mudanças em CI/CD
- **build**: Mudanças no sistema de build
- **revert**: Reversão de commit anterior

#### Exemplos de Boas Mensagens

```bash
# Nova funcionalidade
feat: Adiciona autenticação JWT para usuários

Implementa sistema completo de autenticação usando JWT tokens.
Inclui middleware de validação e refresh de tokens.

Closes #45

# Correção de bug
fix: Corrige validação de CPF no cadastro de pacientes

O regex anterior não validava corretamente CPFs com dígitos repetidos.
Atualiza a validação para usar algoritmo oficial da Receita Federal.

Fixes #67

# Documentação
docs: Atualiza README com instruções de deploy

# Refatoração
refactor: Reorganiza estrutura de pastas dos componentes React

Move componentes para estrutura mais modular:
- components/common/ para componentes reutilizáveis
- components/pages/ para componentes específicos de páginas

# Testes
test: Adiciona testes unitários para PacienteService

Cobre cenários de criação, atualização e validação de dados.
Cobertura de testes aumenta para 85%.
```

#### Regras Importantes

1. **Use o imperativo**: "Adiciona" não "Adicionado" ou "Adicionando"
2. **Primeira linha**: Máximo 50 caracteres, sem ponto final
3. **Corpo**: Máximo 72 caracteres por linha
4. **Linha em branco**: Sempre separe título do corpo
5. **Contexto**: Explique o "o quê" e "por quê", não o "como"
6. **Referências**: Use "Closes #123" ou "Fixes #123" para issues

### Usando o Template

Quando você executar `git commit` (sem `-m`), o editor abrirá com o template em português:

```bash
# Fazer commit com template
git add .
git commit

# Ou commit rápido (evite para mudanças complexas)
git commit -m "feat: Adiciona nova funcionalidade"
```

### Aliases Úteis

O projeto inclui aliases em português no `.gitconfig`:

```bash
git st      # git status
git co      # git checkout
git br      # git branch
git ci      # git commit
git ca      # git commit -a
git cm      # git commit -m
git cam     # git commit -am
git l       # log resumido
git la      # log completo
git undo    # desfaz último commit (mantém alterações)
git unstage # remove do stage
git last    # mostra último commit
```

### Fluxo de Trabalho Recomendado

1. **Crie uma branch** para sua funcionalidade:
   ```bash
   git checkout -b feat/nova-funcionalidade
   ```

2. **Faça commits pequenos e frequentes**:
   ```bash
   git add arquivo-modificado.js
   git commit  # Use o template
   ```

3. **Mantenha histórico limpo**:
   ```bash
   # Se necessário, combine commits relacionados
   git rebase -i HEAD~3
   ```

4. **Antes do merge**, certifique-se que está atualizado:
   ```bash
   git checkout main
   git pull origin main
   git checkout feat/nova-funcionalidade
   git rebase main
   ```

### Verificação de Qualidade

Antes de fazer push, execute:

```bash
# Verificar linting
npm run lint

# Verificar tipos TypeScript
npm run type-check

# Executar build
npm run build

# Executar testes (se disponível)
npm run test
```

---

**Lembre-se**: Mensagens de commit bem escritas facilitam a manutenção do código e ajudam toda a equipe a entender o histórico do projeto.