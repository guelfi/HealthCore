# 📋 03 - Dialogs Mobile-First - Implementação

## ✅ **STATUS DA IMPLEMENTAÇÃO**

**Status**: EM_ANDAMENTO
**Prioridade**: 🚨 ALTA
**Estimativa**: 4-5 horas
**Responsável**: Desenvolvedor Frontend

### 🎯 **Objetivo**
Otimizar todos os dialogs e modais para experiência mobile-first, implementando fullscreen em mobile, formulários otimizados para touch e navegação por gestos.

### 📁 **Estrutura Criada/Modificada**

```
src/Web/src/
├── components/
│   ├── common/
│   │   ├── Dialog.tsx (modificado)
│   │   ├── MobileDialog.tsx (novo)
│   │   └── DialogHeader.tsx (novo)
│   ├── patients/
│   │   └── PatientDialog.tsx (modificado)
│   ├── doctors/
│   │   └── DoctorDialog.tsx (modificado)
│   └── exams/
│       └── ExamDialog.tsx (modificado)
├── styles/
│   ├── dialogs.scss (modificado)
│   └── mobile-dialogs.scss (novo)
└── hooks/
    ├── useDialog.ts (novo)
    └── useSwipeGestures.ts (novo)
```

### 🛠️ **Funcionalidades Implementadas**

#### 1. **Sistema de Dialog Responsivo**
- [ ] Criar componente MobileDialog para telas < 768px
- [ ] Implementar Dialog padrão para desktop
- [ ] Configurar detecção automática de dispositivo
- [ ] Adicionar transições específicas por plataforma

#### 2. **Layout Fullscreen Mobile**
- [ ] Implementar modais fullscreen em mobile
- [ ] Configurar header fixo com título e botões
- [ ] Adicionar área de conteúdo scrollável
- [ ] Implementar footer fixo para ações principais

#### 3. **Formulários Otimizados para Touch**
- [ ] Aumentar tamanho de campos de input (min 44px altura)
- [ ] Implementar labels flutuantes para economia de espaço
- [ ] Configurar teclados específicos por tipo de campo
- [ ] Adicionar validação em tempo real com feedback visual

#### 4. **Navegação por Gestos**
- [ ] Implementar swipe down para fechar (pull to dismiss)
- [ ] Adicionar drag handle visual no topo
- [ ] Configurar threshold de fechamento (30% da tela)
- [ ] Implementar animação de rubber band

#### 5. **Botões e Ações Touch-Friendly**
- [ ] Garantir área mínima de 44px para todos os botões
- [ ] Implementar espaçamento adequado (8px mínimo)
- [ ] Adicionar estados visuais claros (pressed, disabled)
- [ ] Configurar feedback tátil (vibração) quando disponível

#### 6. **Transições e Animações**
- [ ] Implementar slide-up animation para mobile
- [ ] Configurar fade-in para desktop
- [ ] Adicionar spring animations para gestos
- [ ] Otimizar para 60fps em dispositivos médios

### 🔍 **Problema Identificado**
Os modais atuais são pequenos demais em mobile, dificultando a interação touch. Problemas específicos:
- Formulários cramped com campos muito próximos
- Botões pequenos causando cliques acidentais
- Falta de feedback visual adequado
- Dificuldade para fechar modais em touch
- Teclado virtual cobrindo campos importantes
- Experiência inconsistente entre dispositivos

### 🛠️ **Solução Técnica Detalhada**

#### **1. Componente Dialog Responsivo**
```typescript
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  mobileFullscreen?: boolean;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  mobileFullscreen = true,
  children
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  return isMobile && mobileFullscreen ? (
    <MobileDialog {...props} />
  ) : (
    <DesktopDialog {...props} />
  );
};
```

#### **2. Layout Mobile Fullscreen**
```scss
.mobile-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  
  .dialog-header {
    position: sticky;
    top: 0;
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    background: white;
    z-index: 10;
  }
  
  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 80px; // espaço para footer
  }
  
  .dialog-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: white;
    border-top: 1px solid #e0e0e0;
  }
}
```

#### **3. Hook de Gestos**
```typescript
const useSwipeGestures = (onSwipeDown: () => void) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleTouchStart = (e: TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };
  
  const handleTouchEnd = () => {
    const deltaY = currentY - startY;
    if (deltaY > window.innerHeight * 0.3) {
      onSwipeDown();
    }
    setIsDragging(false);
  };
  
  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};
```

### ✅ **Critérios de Aceitação**

- [ ] Modais fullscreen em dispositivos móveis (< 768px)
- [ ] Formulários fáceis de preencher com campos grandes
- [ ] Botões com área de toque ≥ 44px
- [ ] Navegação intuitiva por gestos (swipe to dismiss)
- [ ] Transições suaves e performáticas
- [ ] Teclado virtual não bloqueia campos importantes
- [ ] Estados visuais claros para todos os elementos interativos
- [ ] Compatibilidade com screen readers
- [ ] Performance mantida em dispositivos médios

### 🧪 **Plano de Testes**

#### **Testes de Usabilidade Mobile**
- [ ] Facilidade de preenchimento de formulários
- [ ] Intuitividade dos gestos de fechamento
- [ ] Clareza dos estados visuais
- [ ] Tempo de conclusão de tarefas

#### **Testes de Compatibilidade**
- [ ] iPhone SE (375px) - Safari
- [ ] iPhone 12 (390px) - Safari
- [ ] Samsung Galaxy (360px) - Chrome
- [ ] iPad (768px) - Safari
- [ ] Tablet Android (800px) - Chrome

#### **Testes de Performance**
- [ ] Tempo de abertura < 300ms
- [ ] Animações a 60fps
- [ ] Memory usage otimizado
- [ ] Battery impact mínimo

#### **Testes de Acessibilidade**
- [ ] Navegação por teclado
- [ ] Screen reader compatibility
- [ ] Focus management adequado
- [ ] Contraste de cores WCAG AA

### 📊 **Configuração por Tipo de Dialog**

#### **Dialog de Paciente**
```typescript
const PatientDialogConfig = {
  mobileLayout: {
    sections: ['dados-pessoais', 'contato', 'medico'],
    keyboardTypes: {
      nome: 'default',
      cpf: 'numeric',
      telefone: 'tel',
      email: 'email'
    }
  },
  validation: {
    realTime: true,
    showErrors: 'onBlur'
  }
};
```

#### **Dialog de Médico**
```typescript
const DoctorDialogConfig = {
  mobileLayout: {
    sections: ['dados-profissionais', 'contato', 'especialidades'],
    keyboardTypes: {
      nome: 'default',
      crm: 'numeric',
      telefone: 'tel',
      email: 'email'
    }
  }
};
```

#### **Dialog de Exame**
```typescript
const ExamDialogConfig = {
  mobileLayout: {
    sections: ['paciente', 'exame', 'agendamento'],
    keyboardTypes: {
      observacoes: 'default',
      data: 'numeric',
      hora: 'numeric'
    }
  }
};
```

### 📊 **Métricas de Sucesso**

- **Usabilidade**: Redução de 50% no tempo de preenchimento
- **Satisfação**: Score > 4.5/5 em pesquisa de UX
- **Erros**: Redução de 70% em cliques acidentais
- **Performance**: Abertura < 300ms, animações 60fps

### 🚀 **Implementação Faseada**

#### **Fase 1**: Estrutura Base (1.5h)
- Criar MobileDialog component
- Implementar detecção de dispositivo
- Configurar layouts básicos

#### **Fase 2**: Formulários Otimizados (1.5h)
- Otimizar campos para touch
- Implementar validação em tempo real
- Configurar teclados específicos

#### **Fase 3**: Gestos e Animações (1h)
- Implementar swipe to dismiss
- Adicionar transições suaves
- Otimizar performance

#### **Fase 4**: Integração e Testes (1h)
- Integrar com dialogs existentes
- Testes extensivos
- Ajustes finais

### 📝 **Considerações de UX**

#### **Hierarquia Visual**
- Header com título claro e botão fechar
- Conteúdo organizado em seções lógicas
- Footer com ações primárias destacadas

#### **Feedback Visual**
- Loading states durante submissão
- Validação em tempo real com ícones
- Estados disabled claros
- Confirmação de ações destrutivas

#### **Navegação**
- Breadcrumb para formulários multi-step
- Botões "Anterior/Próximo" quando aplicável
- Auto-save para formulários longos

### 🔗 **Dependências**

- React 18+
- TypeScript
- Framer Motion (para animações)
- React Hook Form (para formulários)
- Zod (para validação)

### ⚠️ **Riscos e Mitigações**

- **Risco**: Quebra de funcionalidade existente
  - **Mitigação**: Implementação gradual com feature flags

- **Risco**: Performance em dispositivos antigos
  - **Mitigação**: Fallbacks sem animações complexas

- **Risco**: Inconsistência entre plataformas
  - **Mitigação**: Testes extensivos e design system

### 🔄 **Integração com Sistema Existente**

- [ ] Manter APIs de dialog existentes
- [ ] Preservar validações de formulário
- [ ] Integrar com sistema de notificações
- [ ] Manter consistência com design tokens
- [ ] Documentar novos padrões de uso

---

**Criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0