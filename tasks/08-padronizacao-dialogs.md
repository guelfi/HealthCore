# 📋 08 - Padronização de Dialogs - Implementação

## ✅ **STATUS DA IMPLEMENTAÇÃO**

**Status**: EM_ANDAMENTO
**Prioridade**: 🔵 BAIXA
**Estimativa**: 3-4 horas
**Responsável**: Desenvolvedor Frontend

### 🎯 **Objetivo**
Padronizar todos os dialogs da aplicação com design consistente, comportamentos uniformes, acessibilidade adequada e responsividade mobile-first, criando uma experiência de usuário coesa em todas as interações modais.

### 📁 **Estrutura Criada/Modificada**

```
src/Web/src/
├── components/
│   ├── dialogs/
│   │   ├── BaseDialog.tsx (novo)
│   │   ├── ConfirmDialog.tsx (novo)
│   │   ├── FormDialog.tsx (novo)
│   │   ├── InfoDialog.tsx (novo)
│   │   ├── AlertDialog.tsx (novo)
│   │   └── DialogProvider.tsx (novo)
│   ├── patients/
│   │   ├── PatientFormDialog.tsx (modificado)
│   │   └── PatientDeleteDialog.tsx (modificado)
│   ├── doctors/
│   │   ├── DoctorFormDialog.tsx (modificado)
│   │   └── DoctorDeleteDialog.tsx (modificado)
│   └── exams/
│       ├── ExamFormDialog.tsx (modificado)
│       └── ExamDeleteDialog.tsx (modificado)
├── hooks/
│   ├── useDialog.ts (novo)
│   ├── useDialogState.ts (novo)
│   └── useKeyboardNavigation.ts (novo)
├── styles/
│   ├── dialogs.scss (novo)
│   ├── dialog-animations.scss (novo)
│   └── dialog-responsive.scss (novo)
└── types/
    └── dialog.types.ts (novo)
```

### 🛠️ **Funcionalidades Implementadas**

#### 1. **Sistema Base de Dialogs**
- [ ] BaseDialog: Componente fundamental reutilizável
- [ ] Overlay com backdrop blur
- [ ] Animações suaves de entrada/saída
- [ ] Posicionamento centralizado responsivo
- [ ] Controle de z-index hierárquico
- [ ] Focus trap automático

#### 2. **Tipos Específicos de Dialog**
- [ ] ConfirmDialog: Confirmações de ações
- [ ] FormDialog: Formulários em modal
- [ ] InfoDialog: Exibição de informações
- [ ] AlertDialog: Alertas e avisos
- [ ] CustomDialog: Conteúdo personalizado

#### 3. **Responsividade Mobile-First**
- [ ] Full-screen em dispositivos móveis
- [ ] Slide-up animation no mobile
- [ ] Touch gestures (swipe to dismiss)
- [ ] Safe area handling (iOS)
- [ ] Keyboard avoidance automática

#### 4. **Acessibilidade (A11y)**
- [ ] ARIA labels e roles adequados
- [ ] Focus management completo
- [ ] Keyboard navigation (Tab, Escape, Enter)
- [ ] Screen reader compatibility
- [ ] High contrast support
- [ ] Reduced motion support

#### 5. **Gerenciamento de Estado**
- [ ] Context API para dialogs globais
- [ ] Stack de dialogs múltiplos
- [ ] Estado persistente durante navegação
- [ ] Cleanup automático
- [ ] Event handling centralizado

#### 6. **Animações e Transições**
- [ ] Fade in/out para overlay
- [ ] Scale/slide para conteúdo
- [ ] Spring animations suaves
- [ ] Performance otimizada (GPU)
- [ ] Configurável por preferência do usuário

### 🔍 **Problemas Identificados**
Dialogs atuais apresentam:
- Inconsistência visual entre diferentes modais
- Comportamentos diferentes para ações similares
- Falta de responsividade adequada
- Problemas de acessibilidade
- Animações abruptas ou ausentes
- Dificuldade de uso em dispositivos móveis
- Falta de padronização de botões e ações

### 🛠️ **Solução Técnica Detalhada**

#### **1. Base Dialog Component**
```typescript
interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  children
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);
  
  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="dialog-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        ref={dialogRef}
        className={`dialog dialog--${size} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        tabIndex={-1}
      >
        {title && (
          <div className="dialog__header">
            <h2 id="dialog-title" className="dialog__title">{title}</h2>
            {showCloseButton && (
              <button
                className="dialog__close"
                onClick={onClose}
                aria-label="Fechar dialog"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="dialog__content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

#### **2. Confirm Dialog**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling será feito pelo componente pai
    }
  };
  
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={`confirm-dialog confirm-dialog--${variant}`}
    >
      <div className="confirm-dialog__content">
        <div className="confirm-dialog__icon">
          {getIconByVariant(variant)}
        </div>
        <p className="confirm-dialog__message">{message}</p>
      </div>
      
      <div className="dialog__actions">
        <button
          className="btn btn--secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          className={`btn btn--${variant === 'danger' ? 'danger' : 'primary'}`}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn__spinner" />
              Processando...
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </BaseDialog>
  );
};
```

#### **3. Form Dialog**
```typescript
interface FormDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  title: string;
  initialData?: Partial<T>;
  children: (props: {
    data: Partial<T>;
    onChange: (field: keyof T, value: any) => void;
    errors: Record<keyof T, string>;
  }) => React.ReactNode;
  validationSchema?: any;
}

const FormDialog = <T extends Record<string, any>>({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData = {},
  children,
  validationSchema
}: FormDialogProps<T>) => {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationSchema) {
      const validation = validationSchema.safeParse(data);
      if (!validation.success) {
        const fieldErrors = validation.error.flatten().fieldErrors;
        setErrors(fieldErrors);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(data as T);
      onClose();
    } catch (error) {
      // Error será tratado pelo toast system
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="form-dialog">
        <div className="form-dialog__content">
          {children({ data, onChange: handleChange, errors })}
        </div>
        
        <div className="dialog__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn__spinner" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>
    </BaseDialog>
  );
};
```

#### **4. Dialog Hook**
```typescript
const useDialog = () => {
  const { openDialog, closeDialog } = useContext(DialogContext);
  
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      openDialog({
        type: 'confirm',
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };
  
  const alert = (options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      openDialog({
        type: 'alert',
        ...options,
        onClose: resolve
      });
    });
  };
  
  const form = <T>(options: FormDialogOptions<T>): Promise<T | null> => {
    return new Promise((resolve) => {
      openDialog({
        type: 'form',
        ...options,
        onSubmit: (data: T) => resolve(data),
        onCancel: () => resolve(null)
      });
    });
  };
  
  return { confirm, alert, form, closeDialog };
};

// Usage example
const PatientList = () => {
  const { confirm } = useDialog();
  const { showSuccess, showError } = useToast();
  
  const handleDelete = async (patient: Patient) => {
    const confirmed = await confirm({
      title: 'Excluir Paciente',
      message: `Tem certeza que deseja excluir ${patient.name}?`,
      variant: 'danger',
      confirmText: 'Excluir'
    });
    
    if (confirmed) {
      try {
        await deletePatient(patient.id);
        showSuccess('Paciente excluído com sucesso');
      } catch (error) {
        showError('Erro ao excluir paciente');
      }
    }
  };
  
  return (
    // Component JSX
  );
};
```

#### **5. Responsive Styles**
```scss
// Dialog Base Styles
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  
  // Mobile-first approach
  @media (max-width: 768px) {
    align-items: flex-end;
    padding: 0;
  }
}

.dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  // Size variants
  &--sm { width: 400px; }
  &--md { width: 600px; }
  &--lg { width: 800px; }
  &--xl { width: 1000px; }
  
  // Mobile responsive
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
    
    &--sm,
    &--md,
    &--lg,
    &--xl {
      width: 100%;
    }
  }
  
  // iOS safe area
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    @media (max-width: 768px) {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
}

.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    padding: 20px 20px 0;
  }
}

.dialog__title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
}

.dialog__close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
}

.dialog__content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
}

.dialog__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 0 24px 24px;
  border-top: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    padding: 0 20px 20px;
    flex-direction: column-reverse;
    
    .btn {
      width: 100%;
    }
  }
}

// Animations
.dialog-overlay {
  animation: fadeIn 0.2s ease-out;
}

.dialog {
  animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  @media (max-width: 768px) {
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .dialog-overlay,
  .dialog {
    animation: none;
  }
}

// High contrast support
@media (prefers-contrast: high) {
  .dialog {
    border: 2px solid #000;
  }
  
  .dialog__header {
    border-bottom-color: #000;
  }
}
```

### ✅ **Critérios de Aceitação**

#### **Visual Consistency**
- [ ] Todos os dialogs seguem o mesmo padrão visual
- [ ] Espaçamentos e tipografia consistentes
- [ ] Cores e bordas padronizadas
- [ ] Ícones apropriados para cada tipo

#### **Responsividade**
- [ ] Full-screen em dispositivos móveis (<768px)
- [ ] Slide-up animation no mobile
- [ ] Safe area handling no iOS
- [ ] Touch gestures funcionais

#### **Acessibilidade**
- [ ] Focus trap funcional
- [ ] Keyboard navigation completa
- [ ] ARIA labels adequados
- [ ] Screen reader compatibility
- [ ] High contrast support

#### **Funcionalidade**
- [ ] Todos os tipos de dialog implementados
- [ ] Estado de loading em operações assíncronas
- [ ] Validação de formulários
- [ ] Error handling adequado

### 🧪 **Plano de Testes**

#### **Testes de Acessibilidade**
- [ ] Navegação por teclado (Tab, Shift+Tab, Enter, Escape)
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode
- [ ] Reduced motion preference

#### **Testes de Responsividade**
- [ ] iPhone SE (375px)
- [ ] iPad (768px)
- [ ] Desktop (1024px+)
- [ ] Landscape/Portrait orientation

#### **Testes de Usabilidade**
- [ ] Facilidade de uso em touch devices
- [ ] Clareza das ações disponíveis
- [ ] Feedback visual adequado
- [ ] Tempo de resposta aceitável

#### **Testes de Performance**
- [ ] Animações a 60fps
- [ ] Memory leaks em abertura/fechamento
- [ ] Bundle size impact
- [ ] Rendering performance

### 📊 **Componentes a Migrar**

#### **Dialogs Existentes**
- [ ] PatientFormDialog → FormDialog
- [ ] PatientDeleteDialog → ConfirmDialog
- [ ] DoctorFormDialog → FormDialog
- [ ] DoctorDeleteDialog → ConfirmDialog
- [ ] ExamFormDialog → FormDialog
- [ ] ExamDeleteDialog → ConfirmDialog

#### **Novos Dialogs Necessários**
- [ ] BulkDeleteDialog (seleção múltipla)
- [ ] ExportDialog (exportar dados)
- [ ] ImportDialog (importar dados)
- [ ] SettingsDialog (configurações)

### 📊 **Métricas de Sucesso**

- **Consistência**: 100% dos dialogs seguem padrão
- **Acessibilidade**: WCAG 2.1 AA compliance
- **Performance**: Animações a 60fps
- **Usabilidade**: Score > 4.0/5 em testes de usuário
- **Mobile**: 100% funcional em dispositivos touch

### 🚀 **Implementação Faseada**

#### **Fase 1**: Base Components (1.5h)
- Criar BaseDialog, ConfirmDialog, FormDialog
- Implementar estilos responsivos
- Configurar animações

#### **Fase 2**: Dialog System (1h)
- Implementar DialogProvider e useDialog
- Configurar focus management
- Adicionar keyboard navigation

#### **Fase 3**: Migration (1h)
- Migrar dialogs existentes
- Atualizar componentes que usam dialogs
- Testes de integração

#### **Fase 4**: Polish & Testing (0.5h)
- Ajustes finais de UX
- Testes de acessibilidade
- Performance optimization

### 📝 **Design Tokens**

```scss
// Dialog Design Tokens
:root {
  --dialog-overlay-bg: rgba(0, 0, 0, 0.5);
  --dialog-bg: #ffffff;
  --dialog-border-radius: 12px;
  --dialog-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --dialog-padding: 24px;
  --dialog-gap: 12px;
  
  // Mobile overrides
  @media (max-width: 768px) {
    --dialog-border-radius: 16px 16px 0 0;
    --dialog-padding: 20px;
  }
}
```

### 🔗 **Dependências**

- React 18+ (createPortal)
- TypeScript
- CSS3 (animations, backdrop-filter)
- React Hook Form (opcional, para formulários)
- Zod (opcional, para validação)

### ⚠️ **Riscos e Mitigações**

- **Risco**: Breaking changes em dialogs existentes
  - **Mitigação**: Migração gradual, manter compatibilidade

- **Risco**: Performance de animações em dispositivos antigos
  - **Mitigação**: Fallbacks, prefers-reduced-motion

- **Risco**: Complexidade de focus management
  - **Mitigação**: Usar bibliotecas testadas, testes abrangentes

### 🔄 **Padrões de Uso**

#### **Confirmação de Exclusão**
```typescript
const handleDelete = async (item: Item) => {
  const confirmed = await confirm({
    title: 'Excluir Item',
    message: `Tem certeza que deseja excluir "${item.name}"?`,
    variant: 'danger'
  });
  
  if (confirmed) {
    await deleteItem(item.id);
  }
};
```

#### **Formulário de Edição**
```typescript
const handleEdit = async (item: Item) => {
  const result = await form({
    title: 'Editar Item',
    initialData: item,
    validationSchema: itemSchema
  });
  
  if (result) {
    await updateItem(item.id, result);
  }
};
```

---

**Criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0