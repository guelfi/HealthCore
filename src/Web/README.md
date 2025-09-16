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

3. Acesse http://localhost:3000

## 📋 Próximas Etapas

- [ ] Instalar Material-UI e dependências principais
- [ ] Configurar Zustand para gerenciamento de estado
- [ ] Implementar sistema de roteamento
- [ ] Criar componentes base da aplicação
- [ ] Implementar autenticação e autorização

## 🎯 Funcionalidades Planejadas

- Sistema de autenticação com JWT
- Dashboard adaptativo por perfil (Admin/Médico)
- Gestão de pacientes e exames
- Interface responsiva e acessível
- Gerenciamento de sessão com controle de inatividade
