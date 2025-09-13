#!/bin/bash

# 🚀 Script de Setup - Branch UI/UX Improvements
# Este script prepara o ambiente para implementação das melhorias UI/UX

set -e

echo "🎨 HealthCore - Setup UI/UX Improvements Branch"
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "HealthCore.sln" ]; then
    log_error "Este script deve ser executado na raiz do projeto HealthCore"
    exit 1
fi

log_info "Verificando status do Git..."

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Há mudanças não commitadas. Recomenda-se fazer commit antes de continuar."
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operação cancelada pelo usuário."
        exit 0
    fi
fi

# Atualizar branch main/master
log_info "Atualizando branch principal..."
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
git checkout $MAIN_BRANCH
git pull origin $MAIN_BRANCH

# Criar nova branch para UI/UX improvements
log_info "Criando branch feature/ui-ux-improvements..."
if git show-ref --verify --quiet refs/heads/feature/ui-ux-improvements; then
    log_warning "Branch feature/ui-ux-improvements já existe."
    read -p "Deseja fazer checkout para ela? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout feature/ui-ux-improvements
        git pull origin feature/ui-ux-improvements 2>/dev/null || log_info "Branch local, sem remote ainda."
    fi
else
    git checkout -b feature/ui-ux-improvements
    log_success "Branch feature/ui-ux-improvements criada com sucesso!"
fi

# Navegar para o diretório do frontend
cd src/Web

log_info "Verificando estrutura do projeto frontend..."

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado no diretório src/Web"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências do frontend..."
    npm install
    log_success "Dependências instaladas!"
else
    log_info "Verificando se há novas dependências..."
    npm install
fi

# Criar estrutura de pastas para UI/UX
log_info "Criando estrutura de pastas para melhorias UI/UX..."

# Estrutura de estilos
mkdir -p src/styles/design-system
mkdir -p src/styles/components
mkdir -p src/styles/layouts
mkdir -p src/styles/utilities

# Estrutura de componentes
mkdir -p src/components/ui/Button
mkdir -p src/components/ui/Card
mkdir -p src/components/ui/Dialog
mkdir -p src/components/ui/Table
mkdir -p src/components/ui/Form
mkdir -p src/components/ui/Navigation
mkdir -p src/components/layout/Dashboard
mkdir -p src/components/layout/CrudLayout
mkdir -p src/components/layout/ResponsiveGrid

log_success "Estrutura de pastas criada!"

# Criar arquivos base do design system
log_info "Criando arquivos base do design system..."

# Tokens de design
cat > src/styles/design-system/tokens.scss << 'EOF'
// 🎨 Design Tokens - HealthCore UI/UX
// Tokens base para consistência visual

// ===== CORES =====
// Primárias
$primary: #2563eb;
$primary-light: #3b82f6;
$primary-dark: #1d4ed8;
$primary-50: #eff6ff;
$primary-100: #dbeafe;
$primary-500: $primary;
$primary-600: #2563eb;
$primary-700: $primary-dark;
$primary-900: #1e3a8a;

// Secundárias
$secondary: #64748b;
$secondary-light: #94a3b8;
$secondary-dark: #475569;

// Status
$success: #10b981;
$success-light: #34d399;
$success-dark: #059669;

$warning: #f59e0b;
$warning-light: #fbbf24;
$warning-dark: #d97706;

$danger: #ef4444;
$danger-light: #f87171;
$danger-dark: #dc2626;

$info: #3b82f6;
$info-light: #60a5fa;
$info-dark: #2563eb;

// Neutras
$neutral-50: #f8fafc;
$neutral-100: #f1f5f9;
$neutral-200: #e2e8f0;
$neutral-300: #cbd5e1;
$neutral-400: #94a3b8;
$neutral-500: #64748b;
$neutral-600: #475569;
$neutral-700: #334155;
$neutral-800: #1e293b;
$neutral-900: #0f172a;

// ===== TIPOGRAFIA =====
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

// Tamanhos
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px
$font-size-3xl: 1.875rem;  // 30px
$font-size-4xl: 2.25rem;   // 36px
$font-size-5xl: 3rem;      // 48px

// Pesos
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;

// Line Heights
$line-height-tight: 1.25;
$line-height-snug: 1.375;
$line-height-normal: 1.5;
$line-height-relaxed: 1.625;
$line-height-loose: 2;

// ===== ESPAÇAMENTOS =====
$spacing-0: 0;
$spacing-1: 0.25rem;  // 4px
$spacing-2: 0.5rem;   // 8px
$spacing-3: 0.75rem;  // 12px
$spacing-4: 1rem;     // 16px
$spacing-5: 1.25rem;  // 20px
$spacing-6: 1.5rem;   // 24px
$spacing-7: 1.75rem;  // 28px
$spacing-8: 2rem;     // 32px
$spacing-9: 2.25rem;  // 36px
$spacing-10: 2.5rem;  // 40px
$spacing-11: 2.75rem; // 44px
$spacing-12: 3rem;    // 48px
$spacing-14: 3.5rem;  // 56px
$spacing-16: 4rem;    // 64px
$spacing-20: 5rem;    // 80px
$spacing-24: 6rem;    // 96px
$spacing-32: 8rem;    // 128px

// ===== BREAKPOINTS =====
$breakpoint-xs: 475px;
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// ===== SOMBRAS =====
$shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
$shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

// ===== BORDAS =====
$border-width: 1px;
$border-width-2: 2px;
$border-width-4: 4px;
$border-width-8: 8px;

$border-radius-none: 0;
$border-radius-sm: 0.125rem;  // 2px
$border-radius-base: 0.25rem; // 4px
$border-radius-md: 0.375rem;  // 6px
$border-radius-lg: 0.5rem;    // 8px
$border-radius-xl: 0.75rem;   // 12px
$border-radius-2xl: 1rem;     // 16px
$border-radius-3xl: 1.5rem;   // 24px
$border-radius-full: 9999px;

// ===== Z-INDEX =====
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;
$z-index-toast: 1080;

// ===== TRANSIÇÕES =====
$transition-fast: 0.15s ease-in-out;
$transition-base: 0.2s ease-in-out;
$transition-slow: 0.3s ease-in-out;
$transition-slower: 0.5s ease-in-out;

// ===== TOUCH TARGETS =====
$touch-target-min: 44px;
$touch-target-comfortable: 48px;
$touch-target-large: 56px;
EOF

# Breakpoints responsivos
cat > src/styles/design-system/breakpoints.scss << 'EOF'
// 📱 Breakpoints Responsivos - HealthCore
// Sistema de breakpoints mobile-first

@import './tokens.scss';

// Mixins para media queries
@mixin mobile-only {
  @media (max-width: #{$breakpoint-sm - 1px}) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: #{$breakpoint-sm}) {
    @content;
  }
}

@mixin tablet-only {
  @media (min-width: #{$breakpoint-sm}) and (max-width: #{$breakpoint-lg - 1px}) {
    @content;
  }
}

@mixin desktop-up {
  @media (min-width: #{$breakpoint-lg}) {
    @content;
  }
}

@mixin desktop-only {
  @media (min-width: #{$breakpoint-lg}) and (max-width: #{$breakpoint-xl - 1px}) {
    @content;
  }
}

@mixin large-desktop-up {
  @media (min-width: #{$breakpoint-xl}) {
    @content;
  }
}

// Utilitários de breakpoint
.mobile-only {
  @include tablet-up {
    display: none !important;
  }
}

.tablet-up {
  @include mobile-only {
    display: none !important;
  }
}

.desktop-up {
  @media (max-width: #{$breakpoint-lg - 1px}) {
    display: none !important;
  }
}
EOF

# Arquivo principal de estilos
cat > src/styles/main.scss << 'EOF'
// 🎨 Main Styles - HealthCore UI/UX
// Arquivo principal que importa todos os estilos

// Design System
@import './design-system/tokens';
@import './design-system/breakpoints';

// Reset e base
@import './base/reset';
@import './base/typography';

// Componentes
@import './components/buttons';
@import './components/cards';
@import './components/dialogs';
@import './components/tables';
@import './components/forms';
@import './components/navigation';

// Layouts
@import './layouts/dashboard';
@import './layouts/crud';
@import './layouts/responsive';

// Utilitários
@import './utilities/helpers';
@import './utilities/animations';
@import './utilities/accessibility';
EOF

# Reset CSS base
mkdir -p src/styles/base
cat > src/styles/base/reset.scss << 'EOF'
// 🔄 CSS Reset - HealthCore
// Reset moderno e acessível

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-normal;
  color: $neutral-900;
  background-color: $neutral-50;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Melhorar acessibilidade para usuários que preferem movimento reduzido
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// Focus visível para acessibilidade
:focus-visible {
  outline: 2px solid $primary;
  outline-offset: 2px;
}

// Remover outline padrão apenas quando focus-visible é suportado
:focus:not(:focus-visible) {
  outline: none;
}

// Elementos de formulário
input,
button,
textarea,
select {
  font: inherit;
}

// Botões
button {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
}

// Links
a {
  color: $primary;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

// Imagens
img {
  max-width: 100%;
  height: auto;
}

// Tabelas
table {
  border-collapse: collapse;
  width: 100%;
}

// Listas
ul,
ol {
  padding-left: $spacing-6;
}

// Títulos
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 $spacing-4 0;
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
}

h1 { font-size: $font-size-4xl; }
h2 { font-size: $font-size-3xl; }
h3 { font-size: $font-size-2xl; }
h4 { font-size: $font-size-xl; }
h5 { font-size: $font-size-lg; }
h6 { font-size: $font-size-base; }

// Parágrafos
p {
  margin: 0 0 $spacing-4 0;
}
EOF

log_success "Arquivos base do design system criados!"

# Criar arquivo de configuração do Sass
log_info "Configurando Sass..."

# Verificar se vite.config.ts existe e adicionar configuração Sass se necessário
if [ -f "vite.config.ts" ]; then
    log_info "Configuração do Vite encontrada. Verificando configuração Sass..."
    # Aqui poderia adicionar configuração automática do Sass no Vite
fi

# Voltar para o diretório raiz
cd ../..

log_info "Criando documentação de desenvolvimento..."

# Criar guia de desenvolvimento
cat > tasks/melhorias-UI-UX/GUIA_DESENVOLVIMENTO.md << 'EOF'
# 🛠️ Guia de Desenvolvimento - UI/UX Improvements

## 🚀 Setup Inicial Concluído

O script de setup criou a seguinte estrutura:

### Estrutura de Arquivos
```
src/Web/src/
├── styles/
│   ├── design-system/
│   │   ├── tokens.scss          ✅ Criado
│   │   └── breakpoints.scss     ✅ Criado
│   ├── base/
│   │   └── reset.scss           ✅ Criado
│   ├── components/              📁 Pronto para componentes
│   ├── layouts/                 📁 Pronto para layouts
│   ├── utilities/               📁 Pronto para utilitários
│   └── main.scss                ✅ Arquivo principal
├── components/
│   ├── ui/                      📁 Componentes reutilizáveis
│   └── layout/                  📁 Componentes de layout
```

## 📋 Próximos Passos

### 1. Completar CRUD Usuários
- [ ] Auditar funcionalidades existentes
- [ ] Implementar funcionalidades faltantes
- [ ] Testar todas as operações CRUD

### 2. Iniciar Fase 1 - Dashboard
- [ ] Importar estilos base no projeto
- [ ] Criar componente Button
- [ ] Criar componente Card
- [ ] Implementar layout responsivo do Dashboard

### 3. Configurar Ferramentas
- [ ] Configurar Sass no build
- [ ] Setup de linting CSS
- [ ] Configurar Lighthouse CI

## 🎨 Usando o Design System

### Importar Tokens
```scss
@import '../styles/design-system/tokens';

.meu-componente {
  color: $primary;
  padding: $spacing-4;
  border-radius: $border-radius-md;
}
```

### Usar Breakpoints
```scss
@import '../styles/design-system/breakpoints';

.meu-componente {
  // Mobile first
  padding: $spacing-2;
  
  @include tablet-up {
    padding: $spacing-4;
  }
  
  @include desktop-up {
    padding: $spacing-6;
  }
}
```

## 🧪 Testes

### Performance
```bash
# Lighthouse CI
npm run lighthouse

# Bundle analyzer
npm run analyze
```

### Acessibilidade
```bash
# Axe testing
npm run test:a11y
```

## 📞 Suporte

Consulte os documentos na pasta `/tasks/melhorias-UI-UX/` para mais detalhes sobre o plano de implementação.
EOF

log_success "Setup concluído com sucesso! 🎉"
echo
log_info "📋 Resumo do que foi criado:"
echo "   ✅ Branch feature/ui-ux-improvements"
echo "   ✅ Estrutura de pastas para UI/UX"
echo "   ✅ Design system base (tokens, breakpoints, reset)"
echo "   ✅ Arquivo principal de estilos"
echo "   ✅ Guia de desenvolvimento"
echo
log_info "📖 Próximos passos:"
echo "   1. Revisar o PLANO_IMPLEMENTACAO_FASEADO.md"
echo "   2. Completar o CRUD de Usuários"
echo "   3. Iniciar Fase 1 - Dashboard"
echo
log_info "🎯 Branch atual: $(git branch --show-current)"
log_info "📁 Estrutura criada em: src/Web/src/"
echo
log_success "Pronto para começar o desenvolvimento! 🚀"