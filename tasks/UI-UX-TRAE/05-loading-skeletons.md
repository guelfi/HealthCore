# 📋 05 - Loading Skeletons - Implementação

## ✅ **STATUS DA IMPLEMENTAÇÃO**

**Status**: EM_ANDAMENTO
**Prioridade**: 📊 MÉDIA
**Estimativa**: 3-4 horas
**Responsável**: Desenvolvedor Frontend

### 🎯 **Objetivo**
Substituir spinners genéricos por skeleton screens que mostram a estrutura do conteúdo sendo carregado, melhorando a percepção de performance e reduzindo a ansiedade do usuário.

### 📁 **Estrutura Criada/Modificada**

```
src/Web/src/
├── components/
│   ├── common/
│   │   ├── Skeleton.tsx (novo)
│   │   ├── SkeletonText.tsx (novo)
│   │   ├── SkeletonAvatar.tsx (novo)
│   │   └── SkeletonCard.tsx (novo)
│   ├── patients/
│   │   ├── PatientSkeleton.tsx (novo)
│   │   └── PatientCardSkeleton.tsx (novo)
│   ├── doctors/
│   │   ├── DoctorSkeleton.tsx (novo)
│   │   └── DoctorCardSkeleton.tsx (novo)
│   └── exams/
│       ├── ExamSkeleton.tsx (novo)
│       └── ExamCardSkeleton.tsx (novo)
├── styles/
│   ├── skeletons.scss (novo)
│   └── shimmer-animations.scss (novo)
└── hooks/
    └── useSkeleton.ts (novo)
```

### 🛠️ **Funcionalidades Implementadas**

#### 1. **Componentes Base de Skeleton**
- [ ] Skeleton: Componente base configurável
- [ ] SkeletonText: Para linhas de texto com diferentes larguras
- [ ] SkeletonAvatar: Para imagens circulares/quadradas
- [ ] SkeletonCard: Para estruturas de card completas

#### 2. **Skeletons Específicos por Contexto**
- [ ] PatientSkeleton: Estrutura da lista de pacientes
- [ ] PatientCardSkeleton: Card individual de paciente
- [ ] DoctorSkeleton: Estrutura da lista de médicos
- [ ] DoctorCardSkeleton: Card individual de médico
- [ ] ExamSkeleton: Estrutura da lista de exames
- [ ] ExamCardSkeleton: Card individual de exame

#### 3. **Sistema de Animações Shimmer**
- [ ] Implementar efeito shimmer suave e não distrativo
- [ ] Configurar velocidade de animação (2s por ciclo)
- [ ] Adicionar gradiente de brilho sutil
- [ ] Otimizar para performance (GPU acceleration)

#### 4. **Layouts Responsivos**
- [ ] Adaptar skeletons para diferentes breakpoints
- [ ] Configurar diferentes quantidades por tela:
  - Mobile: 3-4 skeletons
  - Tablet: 6-8 skeletons
  - Desktop: 8-12 skeletons
- [ ] Manter proporções consistentes com conteúdo real

#### 5. **Hook de Gerenciamento**
- [ ] useSkeleton: Hook para controlar estados de loading
- [ ] Configurar delays mínimos para evitar flicker
- [ ] Implementar fallback para conexões muito lentas
- [ ] Adicionar métricas de tempo de carregamento

#### 6. **Integração com Estados de Loading**
- [ ] Substituir spinners em listas de dados
- [ ] Implementar em formulários durante submissão
- [ ] Adicionar em navegação entre páginas
- [ ] Configurar para carregamento inicial da aplicação

### 🔍 **Problema Identificado**
Spinners genéricos atuais não fornecem contexto sobre o que está sendo carregado, causando:
- Ansiedade do usuário sobre o tempo de espera
- Percepção de lentidão mesmo em carregamentos rápidos
- Falta de contexto sobre o tipo de conteúdo esperado
- Experiência inferior comparada a aplicações modernas
- Sensação de "quebra" na interface durante carregamentos

### 🛠️ **Solução Técnica Detalhada**

#### **1. Componente Skeleton Base**
```typescript
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1em',
  variant = 'text',
  animation = 'wave',
  className
}) => {
  return (
    <div
      className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
      style={{ width, height }}
      aria-label="Carregando conteúdo..."
    />
  );
};
```

#### **2. Skeleton de Card Complexo**
```typescript
const PatientCardSkeleton: React.FC = () => {
  return (
    <div className="patient-card-skeleton">
      <div className="skeleton-header">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="skeleton-info">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <div className="skeleton-content">
        <Skeleton width="80%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="70%" height={16} />
      </div>
      <div className="skeleton-actions">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  );
};
```

#### **3. Animação Shimmer**
```scss
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  
  &--wave {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200px 100%;
    animation: shimmer 2s infinite linear;
  }
  
  &--pulse {
    animation: pulse 2s infinite ease-in-out;
  }
  
  &--text {
    border-radius: 4px;
    height: 1em;
    
    &:last-child {
      width: 80%; // Última linha mais curta
    }
  }
  
  &--circular {
    border-radius: 50%;
  }
  
  &--rectangular {
    border-radius: 8px;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

#### **4. Hook de Controle**
```typescript
const useSkeleton = (isLoading: boolean, minDelay: number = 300) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      // Delay mínimo para evitar flicker
      timer = setTimeout(() => {
        setShowSkeleton(true);
        setHasShown(true);
      }, minDelay);
    } else {
      setShowSkeleton(false);
    }
    
    return () => clearTimeout(timer);
  }, [isLoading, minDelay]);
  
  return { showSkeleton, hasShown };
};
```

### ✅ **Critérios de Aceitação**

- [ ] Skeletons refletem fielmente a estrutura do conteúdo real
- [ ] Animações suaves e não distrativas (2s por ciclo)
- [ ] Carregamento percebido 30% mais rápido que spinners
- [ ] Responsivos em todos os breakpoints
- [ ] Performance otimizada (60fps, baixo CPU)
- [ ] Acessíveis com screen readers
- [ ] Delay mínimo de 300ms para evitar flicker
- [ ] Fallback gracioso para conexões lentas
- [ ] Consistência visual com design system

### 🧪 **Plano de Testes**

#### **Testes de Percepção de Performance**
- [ ] A/B test: Skeleton vs Spinner
- [ ] Medição de tempo percebido de carregamento
- [ ] Pesquisa de satisfação do usuário
- [ ] Análise de bounce rate durante loading

#### **Testes de Performance Técnica**
- [ ] CPU usage durante animações
- [ ] Memory consumption dos skeletons
- [ ] Frame rate das animações (60fps)
- [ ] Battery impact em dispositivos móveis

#### **Testes de Acessibilidade**
- [ ] Screen reader compatibility
- [ ] Navegação por teclado durante loading
- [ ] Contraste adequado para baixa visão
- [ ] Suporte a prefers-reduced-motion

#### **Testes de Compatibilidade**
- [ ] Chrome (desktop e mobile)
- [ ] Safari (macOS e iOS)
- [ ] Firefox (desktop e mobile)
- [ ] Edge (desktop)

### 📊 **Configuração por Contexto**

#### **Lista de Pacientes**
```typescript
const PatientListSkeleton = () => {
  const skeletonCount = useBreakpointValue({ base: 3, md: 6, lg: 8 });
  
  return (
    <div className="patient-list-skeleton">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <PatientCardSkeleton key={index} />
      ))}
    </div>
  );
};
```

#### **Formulário de Paciente**
```typescript
const PatientFormSkeleton = () => {
  return (
    <div className="patient-form-skeleton">
      <Skeleton width="40%" height={24} /> {/* Título */}
      <div className="form-row">
        <Skeleton width="100%" height={48} /> {/* Campo nome */}
      </div>
      <div className="form-row">
        <Skeleton width="48%" height={48} /> {/* CPF */}
        <Skeleton width="48%" height={48} /> {/* Telefone */}
      </div>
      <div className="form-actions">
        <Skeleton width={100} height={40} /> {/* Botão salvar */}
        <Skeleton width={100} height={40} /> {/* Botão cancelar */}
      </div>
    </div>
  );
};
```

### 📊 **Métricas de Sucesso**

- **Percepção**: 30% melhoria na percepção de velocidade
- **Satisfação**: Score > 4.0/5 para experiência de loading
- **Performance**: Animações a 60fps, CPU < 5%
- **Acessibilidade**: 100% compatível com screen readers

### 🚀 **Implementação Faseada**

#### **Fase 1**: Componentes Base (1h)
- Criar Skeleton, SkeletonText, SkeletonAvatar
- Implementar animações shimmer
- Configurar estilos responsivos

#### **Fase 2**: Skeletons Específicos (1.5h)
- Criar PatientSkeleton, DoctorSkeleton, ExamSkeleton
- Implementar layouts que espelham conteúdo real
- Configurar diferentes quantidades por breakpoint

#### **Fase 3**: Hook e Lógica (0.5h)
- Implementar useSkeleton hook
- Configurar delays e fallbacks
- Adicionar métricas de performance

#### **Fase 4**: Integração (1h)
- Substituir spinners existentes
- Testes em diferentes cenários
- Ajustes finais de UX

### 📝 **Considerações de UX**

#### **Princípios de Design**
- **Fidelidade**: Skeleton deve ser similar ao conteúdo final
- **Sutileza**: Animações discretas, não chamativas
- **Consistência**: Padrões uniformes em toda aplicação
- **Performance**: Não deve impactar negativamente a performance

#### **Quando Usar Skeletons**
- ✅ Carregamento inicial de listas
- ✅ Navegação entre páginas
- ✅ Submissão de formulários
- ✅ Carregamento de dados após filtros
- ❌ Carregamentos muito rápidos (< 200ms)
- ❌ Operações em background

### 🔗 **Dependências**

- React 18+
- TypeScript
- CSS3 (para animações)
- Styled Components (opcional)

### ⚠️ **Riscos e Mitigações**

- **Risco**: Over-engineering de skeletons
  - **Mitigação**: Focar em casos de uso principais

- **Risco**: Performance das animações
  - **Mitigação**: Usar CSS transforms e will-change

- **Risco**: Inconsistência com conteúdo real
  - **Mitigação**: Revisões regulares e testes visuais

### 🔄 **Integração com Estados Existentes**

#### **Substituição Gradual**
```typescript
// Antes
if (isLoading) {
  return <Spinner />;
}

// Depois
if (isLoading) {
  return <PatientListSkeleton />;
}
```

#### **Com Hook Personalizado**
```typescript
const PatientList = () => {
  const { data, isLoading } = usePatients();
  const { showSkeleton } = useSkeleton(isLoading);
  
  if (showSkeleton) {
    return <PatientListSkeleton />;
  }
  
  return <PatientListContent data={data} />;
};
```

---

**Criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0