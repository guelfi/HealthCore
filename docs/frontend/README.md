# HealthCore Frontend

Frontend da aplicação HealthCore desenvolvido em React + Vite + TypeScript seguindo os princípios de Clean Architecture.

## 🚀 Tecnologias

- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool moderna e rápida
- **SCSS** - Pré-processador CSS com metodologia BEM
- **ESLint + Prettier** - Linting e formatação de código

## 📁 Estrutura do Projeto

```
src/
├── presentation/         # Camada de Apresentação
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas/Views principais
│   ├── layouts/          # Layouts base
│   └── hooks/            # Custom hooks
├── application/          # Camada de Aplicação
│   ├── services/         # Serviços de negócio
│   ├── stores/           # Gerenciamento de estado
│   └── use-cases/        # Casos de uso
├── infrastructure/       # Camada de Infraestrutura
│   ├── api/              # Clientes HTTP
│   ├── storage/          # LocalStorage/SessionStorage
│   └── utils/            # Utilitários
└── domain/               # Camada de Domínio
    ├── entities/         # Entidades de negócio
    ├── interfaces/       # Contratos/Interfaces
    └── enums/            # Enumerações
```

## 🛠️ Scripts Disponíveis

## 🔔 Sistema de Toast Notifications

- Disparo de toasts
  - `addNotification('Operação bem-sucedida', 'success')`
  - `addNotification('Falha na operação', 'error')`
  - `addNotification('Verifique os dados', 'warning')`
  - `addNotification('Informação atualizada', 'info')`

- Opções de customização
  - `duration`: tempo em ms para auto-fechamento. Ex.: `duration: 7000`
  - `position`: `{ vertical: 'top' | 'bottom', horizontal: 'left' | 'right' | 'center' }`
  - `ariaLive`: `'polite' | 'assertive'` para leitores de tela
  - `action`: `{ label: string, onClick: () => void }` para ação opcional

- Exemplos
  - Sucesso padrão: `addNotification('Médico excluído com sucesso.', 'success')`
  - Erro com retry: 
    ```ts
    addNotification('Falha de conexão com o servidor.', 'error', {
      duration: 7000,
      position: { vertical: 'top', horizontal: 'center' },
      ariaLive: 'assertive',
      action: { label: 'Tentar novamente', onClick: retryFn }
    })
    ```

- Comportamento responsivo
  - Desktop: `bottom-right` por padrão
  - Mobile: `top-center` por padrão

- Boas práticas
  - Mensagens curtas e claras com contexto do erro
  - Use `ariaLive='assertive'` apenas para erros críticos
  - Evite toasts encadeados; prefira uma mensagem consolidada
  - Use `action` para caminhos comuns (ex.: "Tentar novamente")

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa linting do código
- `npm run lint:fix` - Corrige problemas de linting automaticamente
- `npm run format` - Formata o código com Prettier
- `npm run format:check` - Verifica formatação do código
- `npm run type-check` - Verifica tipos TypeScript
- `npm run preview` - Visualiza build de produção

## 🚀 Como Executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse http://localhost:5005

## 🧭 Plano e roadmap

A implementação UI/UX SaaS (fases 0-10) está concluída e publicada. Use estes documentos como fonte da verdade:

- [Status](../project-control/STATUS.md)
- [Backlog](../project-control/BACKLOG.md)
- [Plano UI/UX SaaS](../project-control/UI_UX_SAAS_IMPLEMENTATION_PLAN_2026-07-23.md)
- [Requisitos SaaS / evoluções futuras](saas-ui-ux-requirements.md) (PIX, e-mail, Evolution API)
