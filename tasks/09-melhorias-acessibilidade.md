# 📋 09 - Melhorias de Acessibilidade - Implementação

## ✅ **STATUS DA IMPLEMENTAÇÃO**

**Status**: EM_ANDAMENTO
**Prioridade**: 🔵 BAIXA
**Estimativa**: 4-5 horas
**Responsável**: Desenvolvedor Frontend

### 🎯 **Objetivo**
Implementar melhorias abrangentes de acessibilidade para garantir conformidade com WCAG 2.1 AA, tornando a aplicação utilizável por pessoas com deficiências visuais, motoras, auditivas e cognitivas através de tecnologias assistivas.

### 📁 **Estrutura Criada/Modificada**

```
src/Web/src/
├── components/
│   ├── accessibility/
│   │   ├── SkipLink.tsx (novo)
│   │   ├── ScreenReaderOnly.tsx (novo)
│   │   ├── FocusManager.tsx (novo)
│   │   ├── AnnouncementRegion.tsx (novo)
│   │   └── KeyboardNavigation.tsx (novo)
│   ├── forms/
│   │   ├── AccessibleInput.tsx (novo)
│   │   ├── AccessibleSelect.tsx (novo)
│   │   ├── FieldDescription.tsx (novo)
│   │   └── ErrorAnnouncement.tsx (novo)
│   └── common/
│       ├── AccessibleButton.tsx (modificado)
│       ├── AccessibleLink.tsx (modificado)
│       └── LandmarkRegions.tsx (novo)
├── hooks/
│   ├── useAnnouncement.ts (novo)
│   ├── useKeyboardNavigation.ts (novo)
│   ├── useFocusManagement.ts (novo)
│   └── useAccessibilityPreferences.ts (novo)
├── styles/
│   ├── accessibility.scss (novo)
│   ├── high-contrast.scss (novo)
│   ├── focus-styles.scss (novo)
│   └── screen-reader.scss (novo)
├── utils/
│   ├── a11yUtils.ts (novo)
│   ├── ariaHelpers.ts (novo)
│   └── keyboardUtils.ts (novo)
└── tests/
    ├── accessibility/
    │   ├── a11y.test.tsx (novo)
    │   ├── keyboard.test.tsx (novo)
    │   └── screenReader.test.tsx (novo)
```

### 🛠️ **Funcionalidades Implementadas**

#### 1. **Navegação por Teclado**
- [ ] Tab order lógico e consistente
- [ ] Skip links para conteúdo principal
- [ ] Keyboard shortcuts para ações comuns
- [ ] Focus visible em todos os elementos interativos
- [ ] Escape para fechar modais/dropdowns
- [ ] Arrow keys para navegação em listas

#### 2. **Screen Reader Support**
- [ ] ARIA labels descritivos
- [ ] ARIA roles apropriados
- [ ] ARIA states (expanded, selected, checked)
- [ ] ARIA live regions para mudanças dinâmicas
- [ ] Landmark regions (main, nav, aside, footer)
- [ ] Heading hierarchy (h1-h6) estruturada

#### 3. **Contraste e Visibilidade**
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] High contrast mode support
- [ ] Focus indicators visíveis (2px outline)
- [ ] Não depender apenas de cor para informação
- [ ] Tamanhos de fonte escaláveis

#### 4. **Formulários Acessíveis**
- [ ] Labels associados a todos os inputs
- [ ] Descrições de campo quando necessário
- [ ] Mensagens de erro claras e específicas
- [ ] Indicação de campos obrigatórios
- [ ] Agrupamento lógico com fieldsets
- [ ] Validação em tempo real acessível

#### 5. **Conteúdo Dinâmico**
- [ ] Anúncios de mudanças de estado
- [ ] Loading states acessíveis
- [ ] Notificações para screen readers
- [ ] Atualizações de conteúdo anunciadas
- [ ] Progress indicators acessíveis

#### 6. **Preferências do Usuário**
- [ ] Respeitar prefers-reduced-motion
- [ ] Suporte a prefers-color-scheme
- [ ] Configurações de acessibilidade persistentes
- [ ] Zoom até 200% sem scroll horizontal
- [ ] Texto redimensionável

### 🔍 **Problemas de Acessibilidade Identificados**

#### **Navegação por Teclado**
- Falta de skip links
- Tab order inconsistente
- Focus não visível em alguns elementos
- Impossibilidade de usar apenas teclado

#### **Screen Readers**
- Falta de ARIA labels
- Estrutura de headings inadequada
- Conteúdo dinâmico não anunciado
- Landmark regions ausentes

#### **Contraste e Visibilidade**
- Contraste insuficiente em alguns elementos
- Dependência apenas de cor para informação
- Focus indicators inadequados

#### **Formulários**
- Labels não associados
- Mensagens de erro não acessíveis
- Campos obrigatórios não indicados

### 🛠️ **Solução Técnica Detalhada**

#### **1. Skip Links Component**
```typescript
const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="skip-link"
      onFocus={(e) => e.currentTarget.scrollIntoView()}
    >
      {children}
    </a>
  );
};

const SkipNavigation: React.FC = () => {
  return (
    <div className="skip-navigation">
      <SkipLink href="#main-content">Pular para conteúdo principal</SkipLink>
      <SkipLink href="#main-navigation">Pular para navegação</SkipLink>
      <SkipLink href="#search">Pular para busca</SkipLink>
    </div>
  );
};
```

#### **2. Accessible Input Component**
```typescript
interface AccessibleInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  description,
  required = false,
  disabled = false,
  placeholder
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  
  const ariaDescribedBy = [
    descriptionId,
    errorId
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={`input-group ${error ? 'input-group--error' : ''}`}>
      <label htmlFor={id} className="input-label">
        {label}
        {required && (
          <span className="required-indicator" aria-label="obrigatório">
            *
          </span>
        )}
      </label>
      
      {description && (
        <div id={descriptionId} className="input-description">
          {description}
        </div>
      )}
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input ${error ? 'input--error' : ''}`}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        disabled={disabled}
        placeholder={placeholder}
      />
      
      {error && (
        <div
          id={errorId}
          className="input-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
```

#### **3. Announcement Hook**
```typescript
const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear previous announcement
    setAnnouncement('');
    
    // Set new announcement after a brief delay
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
    
    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncement('');
    }, 5000);
  }, []);
  
  const AnnouncementRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
  
  return { announce, AnnouncementRegion };
};

// Usage example
const PatientList = () => {
  const { announce, AnnouncementRegion } = useAnnouncement();
  const { data: patients, isLoading } = usePatients();
  
  useEffect(() => {
    if (!isLoading && patients) {
      announce(`${patients.length} pacientes carregados`);
    }
  }, [isLoading, patients, announce]);
  
  const handleDelete = async (patient: Patient) => {
    await deletePatient(patient.id);
    announce(`Paciente ${patient.name} foi removido`);
  };
  
  return (
    <div>
      <AnnouncementRegion />
      {/* Rest of component */}
    </div>
  );
};
```

#### **4. Focus Management**
```typescript
const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement | null>(null);
  
  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      focusRef.current = element;
      element.focus();
    }
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
      focusRef.current = null;
    }
  }, []);
  
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return { setFocus, restoreFocus, trapFocus };
};
```

#### **5. Keyboard Navigation Hook**
```typescript
const useKeyboardNavigation = (items: any[], onSelect: (item: any) => void) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && items[focusedIndex]) {
          onSelect(items[focusedIndex]);
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  }, [items, focusedIndex, onSelect]);
  
  return { focusedIndex, handleKeyDown, setFocusedIndex };
};
```

#### **6. Accessibility Styles**
```scss
// Screen Reader Only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Skip Links
.skip-navigation {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  font-weight: 600;
  
  &:focus {
    top: 0;
  }
}

// Focus Styles
:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

// High contrast mode
@media (prefers-contrast: high) {
  :focus {
    outline: 3px solid;
    outline-offset: 2px;
  }
  
  .btn {
    border: 2px solid;
  }
  
  .input {
    border: 2px solid;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Input Accessibility
.input-group {
  margin-bottom: 16px;
  
  &--error {
    .input-label {
      color: #dc2626;
    }
    
    .input {
      border-color: #dc2626;
      
      &:focus {
        outline-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }
    }
  }
}

.input-label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #374151;
}

.required-indicator {
  color: #dc2626;
  margin-left: 4px;
}

.input-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  
  &:focus {
    border-color: #3b82f6;
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }
  
  &--error {
    border-color: #dc2626;
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
  }
}

.input-error {
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: "⚠";
    font-weight: bold;
  }
}

// Button Accessibility
.btn {
  position: relative;
  
  &:focus {
    z-index: 1;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  // Loading state
  &--loading {
    color: transparent;
    
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Table Accessibility
.table {
  th {
    &[aria-sort] {
      cursor: pointer;
      
      &::after {
        content: "";
        margin-left: 8px;
      }
      
      &[aria-sort="ascending"]::after {
        content: "↑";
      }
      
      &[aria-sort="descending"]::after {
        content: "↓";
      }
    }
  }
  
  tr {
    &:focus-within {
      background-color: #f3f4f6;
    }
  }
}

// Landmark Regions
main {
  min-height: calc(100vh - 200px);
}

nav[aria-label="Navegação principal"] {
  border-bottom: 1px solid #e5e7eb;
}

aside {
  border-left: 1px solid #e5e7eb;
}

footer {
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}
```

### ✅ **Critérios de Aceitação**

#### **WCAG 2.1 AA Compliance**
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] Todos os elementos interativos acessíveis por teclado
- [ ] Focus visível em todos os elementos focáveis
- [ ] Conteúdo compreensível sem cor

#### **Screen Reader Support**
- [ ] Todos os elementos têm labels apropriados
- [ ] Estrutura de headings lógica (h1-h6)
- [ ] Landmark regions implementadas
- [ ] Estados dinâmicos anunciados
- [ ] Formulários completamente acessíveis

#### **Keyboard Navigation**
- [ ] Tab order lógico e consistente
- [ ] Skip links funcionais
- [ ] Todas as funcionalidades acessíveis por teclado
- [ ] Atalhos de teclado documentados
- [ ] Focus trap em modais

#### **Responsive Accessibility**
- [ ] Zoom até 200% sem scroll horizontal
- [ ] Touch targets mínimo 44x44px
- [ ] Texto redimensionável
- [ ] Funcional em orientação portrait/landscape

### 🧪 **Plano de Testes**

#### **Testes Automatizados**
- [ ] axe-core integration
- [ ] Lighthouse accessibility audit
- [ ] Pa11y command line testing
- [ ] Jest accessibility tests

#### **Testes Manuais**
- [ ] Navegação apenas por teclado
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode
- [ ] Zoom testing (200%, 400%)
- [ ] Mobile accessibility testing

#### **Testes com Usuários**
- [ ] Usuários com deficiência visual
- [ ] Usuários com deficiência motora
- [ ] Usuários de tecnologias assistivas
- [ ] Usuários idosos

### 📊 **Ferramentas de Teste**

```typescript
// Automated A11y Testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<PatientList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should have proper heading structure', () => {
    const { container } = render(<PatientList />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Verify heading hierarchy
    expect(headings[0].tagName).toBe('H1');
    expect(headings[1].tagName).toBe('H2');
  });
  
  test('should have skip links', () => {
    render(<App />);
    const skipLink = screen.getByText('Pular para conteúdo principal');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
```

### 📊 **Métricas de Acessibilidade**

#### **Automated Testing**
- **Lighthouse**: Score > 95
- **axe-core**: 0 violations
- **Pa11y**: 0 errors
- **WAVE**: 0 errors

#### **Manual Testing**
- **Keyboard Navigation**: 100% funcional
- **Screen Reader**: 100% compreensível
- **Contrast**: 100% WCAG AA compliant
- **Zoom**: Funcional até 400%

### 🚀 **Implementação Faseada**

#### **Fase 1**: Foundation (1.5h)
- Implementar skip links
- Configurar focus management
- Adicionar ARIA landmarks
- Corrigir estrutura de headings

#### **Fase 2**: Forms & Inputs (1.5h)
- Criar componentes de input acessíveis
- Implementar validação acessível
- Adicionar descrições de campo
- Configurar anúncios de erro

#### **Fase 3**: Navigation & Interaction (1h)
- Implementar keyboard navigation
- Adicionar ARIA states
- Configurar live regions
- Implementar focus trap

#### **Fase 4**: Testing & Polish (1h)
- Configurar testes automatizados
- Realizar testes manuais
- Ajustar contraste e visibilidade
- Documentar padrões de acessibilidade

### 📝 **Documentação de Acessibilidade**

#### **Keyboard Shortcuts**
- `Tab` / `Shift+Tab`: Navegar entre elementos
- `Enter` / `Space`: Ativar botões/links
- `Escape`: Fechar modais/dropdowns
- `Arrow Keys`: Navegar em listas/menus
- `Home` / `End`: Ir para início/fim

#### **Screen Reader Instructions**
- Usar headings para navegar (H key)
- Usar landmarks para pular seções (D key)
- Usar links para navegar (K key)
- Usar formulários (F key)

### 🔗 **Dependências**

#### **Testing**
- jest-axe
- @testing-library/jest-dom
- @axe-core/react
- pa11y

#### **Runtime**
- React 18+
- TypeScript
- CSS3 (media queries)

### ⚠️ **Riscos e Mitigações**

- **Risco**: Performance impact de ARIA updates
  - **Mitigação**: Debounce announcements, usar live regions eficientemente

- **Risco**: Complexidade de focus management
  - **Mitigação**: Usar bibliotecas testadas, testes abrangentes

- **Risco**: Inconsistência entre browsers/screen readers
  - **Mitigação**: Testes em múltiplas combinações

### 🔄 **Padrões de Implementação**

#### **Formulário Acessível**
```typescript
const AccessibleForm = () => {
  return (
    <form role="form" aria-labelledby="form-title">
      <h2 id="form-title">Cadastro de Paciente</h2>
      
      <fieldset>
        <legend>Dados Pessoais</legend>
        
        <AccessibleInput
          id="name"
          label="Nome completo"
          value={name}
          onChange={setName}
          required
          description="Digite o nome completo do paciente"
        />
        
        <AccessibleInput
          id="cpf"
          label="CPF"
          value={cpf}
          onChange={setCpf}
          required
          error={cpfError}
        />
      </fieldset>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};
```

#### **Lista Acessível**
```typescript
const AccessibleList = ({ items, onSelect }) => {
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation(items, onSelect);
  
  return (
    <div
      role="listbox"
      aria-label="Lista de pacientes"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          className={`list-item ${index === focusedIndex ? 'focused' : ''}`}
          onClick={() => onSelect(item)}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

---

**Criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0