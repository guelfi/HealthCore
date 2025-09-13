# 📋 02 - Tabelas com Scroll Horizontal - Implementação

## ✅ **STATUS DA IMPLEMENTAÇÃO**

**Status**: EM_ANDAMENTO
**Prioridade**: 🚨 ALTA
**Estimativa**: 3-4 horas
**Responsável**: Desenvolvedor Frontend

### 🎯 **Objetivo**
Implementar scroll horizontal responsivo nas tabelas de dados (Pacientes, Médicos, Exames), mantendo colunas críticas sempre visíveis e otimizando a experiência mobile.

### 📁 **Estrutura Criada/Modificada**

```
src/Web/src/
├── components/
│   ├── patients/
│   │   └── PatientTable.tsx (modificado)
│   ├── doctors/
│   │   └── DoctorTable.tsx (modificado)
│   ├── exams/
│   │   └── ExamTable.tsx (modificado)
│   └── common/
│       ├── ResponsiveTable.tsx (novo)
│       └── TableScrollIndicator.tsx (novo)
├── styles/
│   ├── tables.scss (modificado)
│   └── responsive-tables.scss (novo)
└── hooks/
    └── useTableScroll.ts (novo)
```

### 🛠️ **Funcionalidades Implementadas**

#### 1. **Componente ResponsiveTable Base**
- [ ] Criar wrapper responsivo com overflow-x: auto
- [ ] Implementar container com scroll suave
- [ ] Configurar momentum scrolling para iOS
- [ ] Adicionar scroll snap para melhor UX

#### 2. **Sistema de Colunas Fixas**
- [ ] Implementar position: sticky para colunas críticas
- [ ] Configurar z-index apropriado para sobreposição
- [ ] Definir colunas fixas por tipo de tabela:
  - **Pacientes**: Nome, CPF
  - **Médicos**: Nome, CRM
  - **Exames**: Paciente, Data
- [ ] Testar comportamento em diferentes browsers

#### 3. **Indicadores Visuais de Scroll**
- [ ] Criar componente TableScrollIndicator
- [ ] Implementar sombras laterais para indicar conteúdo oculto
- [ ] Adicionar gradientes nas bordas (fade effect)
- [ ] Mostrar/ocultar indicadores baseado na posição do scroll

#### 4. **Otimização Touch e Mobile**
- [ ] Configurar touch-action: pan-x para scroll horizontal
- [ ] Implementar scroll suave com CSS scroll-behavior
- [ ] Adicionar padding extra para área de toque
- [ ] Otimizar performance com will-change: transform

#### 5. **Breakpoints e Layouts Adaptativos**
- [ ] Definir breakpoints específicos para tabelas:
  - **Mobile**: < 768px (scroll completo)
  - **Tablet**: 768px - 1024px (algumas colunas fixas)
  - **Desktop**: > 1024px (layout normal)
- [ ] Implementar diferentes layouts por resolução
- [ ] Configurar colunas visíveis por breakpoint

#### 6. **Hook useTableScroll**
- [ ] Criar hook para gerenciar estado do scroll
- [ ] Implementar detecção de posição (início, meio, fim)
- [ ] Adicionar callbacks para eventos de scroll
- [ ] Otimizar com throttle/debounce

### 🔍 **Problema Identificado**
Tabelas com muitas colunas (especialmente Pacientes e Exames) ficam completamente ilegíveis em dispositivos móveis, forçando os usuários a fazer zoom horizontal desconfortável. Isso resulta em:
- Perda de contexto ao navegar horizontalmente
- Dificuldade para correlacionar dados
- Experiência frustrante em mobile
- Abandono de tarefas por dificuldade de uso

### 🛠️ **Solução Técnica Detalhada**

#### **1. Container Responsivo**
```scss
.responsive-table-container {
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
}
```

#### **2. Colunas Fixas**
```scss
.sticky-column {
  position: sticky;
  left: 0;
  background: white;
  z-index: 10;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}
```

#### **3. Hook de Scroll**
```typescript
export const useTableScroll = () => {
  const [scrollPosition, setScrollPosition] = useState('start');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Lógica de detecção e controle
}
```

### ✅ **Critérios de Aceitação**

- [ ] Scroll horizontal suave em todos os dispositivos móveis
- [ ] Colunas importantes sempre visíveis (sticky)
- [ ] Indicadores visuais claros de conteúdo oculto
- [ ] Performance mantida com grandes volumes de dados (100+ linhas)
- [ ] Compatibilidade com touch gestures
- [ ] Acessibilidade preservada (navegação por teclado)
- [ ] Layout responsivo em todos os breakpoints
- [ ] Sem quebra de funcionalidades existentes (ordenação, filtros)

### 🧪 **Plano de Testes**

#### **Testes de Responsividade**
- [ ] iPhone SE (375px) - portrait/landscape
- [ ] iPhone 12 (390px) - portrait/landscape
- [ ] iPad (768px) - portrait/landscape
- [ ] Tablet Android (800px)
- [ ] Desktop (1200px+)

#### **Testes de Performance**
- [ ] Tabela com 50 linhas
- [ ] Tabela com 100 linhas
- [ ] Tabela com 500+ linhas
- [ ] Scroll performance (60fps)
- [ ] Memory usage durante scroll

#### **Testes de Usabilidade**
- [ ] Facilidade de scroll com dedo
- [ ] Identificação de colunas fixas
- [ ] Compreensão dos indicadores visuais
- [ ] Navegação entre dados relacionados

#### **Testes de Compatibilidade**
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile
- [ ] Samsung Internet
- [ ] Edge Mobile

### 📊 **Configuração por Tabela**

#### **Tabela de Pacientes**
```typescript
const patientTableConfig = {
  stickyColumns: ['nome', 'cpf'],
  mobileColumns: ['nome', 'cpf', 'telefone', 'acoes'],
  tabletColumns: ['nome', 'cpf', 'telefone', 'email', 'medico', 'acoes'],
  desktopColumns: 'all'
};
```

#### **Tabela de Médicos**
```typescript
const doctorTableConfig = {
  stickyColumns: ['nome', 'crm'],
  mobileColumns: ['nome', 'crm', 'especialidade', 'acoes'],
  tabletColumns: ['nome', 'crm', 'especialidade', 'telefone', 'acoes'],
  desktopColumns: 'all'
};
```

#### **Tabela de Exames**
```typescript
const examTableConfig = {
  stickyColumns: ['paciente', 'data'],
  mobileColumns: ['paciente', 'data', 'tipo', 'status', 'acoes'],
  tabletColumns: ['paciente', 'data', 'tipo', 'medico', 'status', 'acoes'],
  desktopColumns: 'all'
};
```

### 📊 **Métricas de Sucesso**

- **Performance**: Scroll a 60fps em dispositivos médios
- **Usabilidade**: Redução de 80% em zooms horizontais
- **Acessibilidade**: Navegação por teclado mantida
- **Compatibilidade**: 100% em browsers principais mobile

### 🚀 **Implementação Faseada**

#### **Fase 1**: Estrutura Base (1h)
- Criar ResponsiveTable component
- Implementar container com scroll
- Configurar estilos básicos

#### **Fase 2**: Colunas Fixas (1h)
- Implementar sticky positioning
- Configurar por tipo de tabela
- Testar em diferentes browsers

#### **Fase 3**: Indicadores Visuais (1h)
- Criar TableScrollIndicator
- Implementar sombras e gradientes
- Adicionar lógica de show/hide

#### **Fase 4**: Otimização e Testes (1h)
- Otimizar performance
- Testes extensivos
- Ajustes finais

### 📝 **Notas de Implementação**

- Usar CSS Grid para layout mais flexível
- Implementar virtual scrolling se performance for crítica
- Considerar lazy loading para tabelas muito grandes
- Manter consistência com design system
- Documentar configurações por tabela

### 🔗 **Dependências**

- React 18+
- TypeScript
- CSS Grid/Flexbox
- Intersection Observer API
- ResizeObserver API

### ⚠️ **Riscos e Mitigações**

- **Risco**: Performance com muitos dados
  - **Mitigação**: Virtual scrolling e paginação

- **Risco**: Quebra de ordenação/filtros
  - **Mitigação**: Testes extensivos de integração

- **Risco**: Inconsistência entre browsers
  - **Mitigação**: Polyfills e fallbacks

### 🔄 **Integração com Funcionalidades Existentes**

- [ ] Manter funcionalidade de ordenação por colunas
- [ ] Preservar filtros e busca
- [ ] Integrar com paginação existente
- [ ] Manter seleção múltipla de linhas
- [ ] Preservar ações em linha (editar, excluir)

---

**Criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0