# 📋 07 - Otimização de Performance - Implementação

## ✅ **STATUS DA IMPLEMENTAÇÃO**

**Status**: EM_ANDAMENTO
**Prioridade**: 📊 MÉDIA
**Estimativa**: 5-6 horas
**Responsável**: Desenvolvedor Frontend/Backend

### 🎯 **Objetivo**
Otimizar performance geral da aplicação através de lazy loading, memoização, code splitting, otimização de bundle e melhorias no backend, visando reduzir tempo de carregamento inicial e melhorar responsividade.

### 📁 **Estrutura Criada/Modificada**

```
src/Web/src/
├── components/
│   ├── lazy/
│   │   ├── LazyPatientList.tsx (novo)
│   │   ├── LazyDoctorList.tsx (novo)
│   │   ├── LazyExamList.tsx (novo)
│   │   └── LazyWrapper.tsx (novo)
│   └── optimized/
│       ├── VirtualizedList.tsx (novo)
│       ├── MemoizedCard.tsx (novo)
│       └── OptimizedTable.tsx (novo)
├── hooks/
│   ├── useVirtualization.ts (novo)
│   ├── useDebounce.ts (novo)
│   ├── useMemoizedData.ts (novo)
│   └── useInfiniteScroll.ts (novo)
├── utils/
│   ├── bundleAnalyzer.ts (novo)
│   ├── performanceMonitor.ts (novo)
│   ├── cacheManager.ts (novo)
│   └── imageOptimizer.ts (novo)
├── services/
│   ├── api/
│   │   ├── caching.ts (novo)
│   │   ├── batching.ts (novo)
│   │   └── compression.ts (novo)
│   └── workers/
│       ├── dataProcessor.worker.ts (novo)
│       └── imageProcessor.worker.ts (novo)
└── config/
    ├── webpack.optimization.js (novo)
    ├── vite.optimization.ts (novo)
    └── performance.config.ts (novo)
```

### 🛠️ **Funcionalidades Implementadas**

#### 1. **Code Splitting e Lazy Loading**
- [ ] Lazy loading de rotas principais
- [ ] Lazy loading de componentes pesados
- [ ] Dynamic imports para bibliotecas grandes
- [ ] Preloading estratégico de recursos
- [ ] Suspense boundaries otimizados
- [ ] Error boundaries para chunks falhados

#### 2. **Otimização de Renderização**
- [ ] React.memo para componentes puros
- [ ] useMemo para cálculos custosos
- [ ] useCallback para funções estáveis
- [ ] Virtualização de listas longas
- [ ] Debounce em inputs de busca
- [ ] Throttle em scroll handlers

#### 3. **Otimização de Bundle**
- [ ] Tree shaking configurado
- [ ] Code splitting por rota
- [ ] Vendor chunks separados
- [ ] Compression (Gzip/Brotli)
- [ ] Minificação otimizada
- [ ] Source maps apenas em dev

#### 4. **Cache e Persistência**
- [ ] Service Worker para cache de assets
- [ ] Cache de API responses
- [ ] LocalStorage para dados frequentes
- [ ] IndexedDB para dados grandes
- [ ] Cache invalidation inteligente
- [ ] Offline-first strategies

#### 5. **Otimização de Imagens**
- [ ] Lazy loading de imagens
- [ ] WebP com fallback
- [ ] Responsive images (srcset)
- [ ] Image compression automática
- [ ] Placeholder blur effect
- [ ] Progressive loading

#### 6. **Otimização de API**
- [ ] Request batching
- [ ] Response compression
- [ ] Pagination eficiente
- [ ] GraphQL para queries específicas
- [ ] Database query optimization
- [ ] Connection pooling

### 🔍 **Problemas de Performance Identificados**

#### **Frontend**
- Bundle inicial muito grande (>2MB)
- Renderizações desnecessárias em listas
- Falta de virtualização em tabelas grandes
- Imagens não otimizadas
- Ausência de cache estratégico
- JavaScript blocking render

#### **Backend**
- Queries N+1 em relacionamentos
- Falta de índices em consultas frequentes
- Serialização JSON ineficiente
- Ausência de compression
- Connection overhead
- Falta de cache de queries

### 🛠️ **Solução Técnica Detalhada**

#### **1. Lazy Loading Implementation**
```typescript
// Lazy Route Loading
const PatientRoutes = lazy(() => import('./pages/Patients'));
const DoctorRoutes = lazy(() => import('./pages/Doctors'));
const ExamRoutes = lazy(() => import('./pages/Exams'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/patients/*" element={<PatientRoutes />} />
          <Route path="/doctors/*" element={<DoctorRoutes />} />
          <Route path="/exams/*" element={<ExamExamRoutes />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

// Lazy Component Loading
const LazyDataTable = lazy(() => 
  import('./components/DataTable').then(module => ({
    default: module.DataTable
  }))
);

const PatientList = () => {
  const [showTable, setShowTable] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowTable(true)}>
        Carregar Tabela
      </button>
      {showTable && (
        <Suspense fallback={<TableSkeleton />}>
          <LazyDataTable />
        </Suspense>
      )}
    </div>
  );
};
```

#### **2. Memoization Strategies**
```typescript
// Memoized Patient Card
const PatientCard = React.memo<PatientCardProps>(({ patient, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(patient.id);
  }, [patient.id, onEdit]);
  
  const handleDelete = useCallback(() => {
    onDelete(patient.id);
  }, [patient.id, onDelete]);
  
  const formattedDate = useMemo(() => {
    return formatDate(patient.createdAt);
  }, [patient.createdAt]);
  
  return (
    <div className="patient-card">
      <h3>{patient.name}</h3>
      <p>{formattedDate}</p>
      <button onClick={handleEdit}>Editar</button>
      <button onClick={handleDelete}>Excluir</button>
    </div>
  );
});

// Memoized List with Virtualization
const VirtualizedPatientList = () => {
  const { data: patients } = usePatients();
  
  const memoizedPatients = useMemo(() => {
    return patients?.map(patient => ({
      ...patient,
      key: patient.id
    })) || [];
  }, [patients]);
  
  const renderItem = useCallback(({ index, style }) => {
    const patient = memoizedPatients[index];
    return (
      <div style={style}>
        <PatientCard patient={patient} />
      </div>
    );
  }, [memoizedPatients]);
  
  return (
    <FixedSizeList
      height={600}
      itemCount={memoizedPatients.length}
      itemSize={120}
    >
      {renderItem}
    </FixedSizeList>
  );
};
```

#### **3. Debounced Search**
```typescript
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

const SearchablePatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { data: patients, isLoading } = usePatients({
    search: debouncedSearchTerm
  });
  
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar pacientes..."
      />
      {isLoading ? (
        <PatientListSkeleton />
      ) : (
        <PatientList patients={patients} />
      )}
    </div>
  );
};
```

#### **4. Bundle Optimization (Vite)**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@emotion/react'],
          utils: ['date-fns', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress' })
  ]
});
```

#### **5. Service Worker Cache**
```typescript
// sw.js
const CACHE_NAME = 'medical-app-v1';
const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Cache API responses with TTL
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            const cachedTime = new Date(response.headers.get('cached-time'));
            const now = new Date();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (now.getTime() - cachedTime.getTime() < fiveMinutes) {
              return response;
            }
          }
          
          return fetch(event.request).then(fetchResponse => {
            const responseClone = fetchResponse.clone();
            responseClone.headers.set('cached-time', new Date().toISOString());
            cache.put(event.request, responseClone);
            return fetchResponse;
          });
        });
      })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

#### **6. Image Optimization**
```typescript
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}> = ({ src, alt, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </picture>
  );
};
```

#### **7. Backend Optimization (C#)**
```csharp
// Query Optimization with EF Core
public async Task<PagedResult<Patient>> GetPatientsAsync(
    int page, int pageSize, string search = null)
{
    var query = _context.Patients
        .AsNoTracking() // Read-only queries
        .Include(p => p.Exams.Take(5)) // Limit related data
        .Where(p => string.IsNullOrEmpty(search) || 
                   p.Name.Contains(search) || 
                   p.Cpf.Contains(search));
    
    var totalCount = await query.CountAsync();
    
    var patients = await query
        .OrderBy(p => p.Name)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
    
    return new PagedResult<Patient>
    {
        Data = patients,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}

// Response Compression
public void ConfigureServices(IServiceCollection services)
{
    services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
    });
    
    services.Configure<BrotliCompressionProviderOptions>(options =>
    {
        options.Level = CompressionLevel.Fastest;
    });
}

// Memory Cache for Frequent Queries
[HttpGet]
public async Task<IActionResult> GetDoctors()
{
    var cacheKey = "doctors_list";
    
    if (!_cache.TryGetValue(cacheKey, out List<Doctor> doctors))
    {
        doctors = await _context.Doctors
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .ToListAsync();
        
        _cache.Set(cacheKey, doctors, TimeSpan.FromMinutes(10));
    }
    
    return Ok(doctors);
}
```

### ✅ **Critérios de Aceitação**

#### **Performance Metrics**
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3s
- [ ] Bundle inicial < 500KB (gzipped)
- [ ] Lighthouse Score > 90

#### **User Experience**
- [ ] Navegação entre páginas < 200ms
- [ ] Busca responsiva com debounce
- [ ] Listas longas virtualizadas
- [ ] Imagens carregam progressivamente
- [ ] Offline básico funcional

#### **Technical**
- [ ] Code splitting implementado
- [ ] Memoização adequada
- [ ] Cache strategies ativas
- [ ] Compression habilitada
- [ ] Database queries otimizadas

### 🧪 **Plano de Testes**

#### **Performance Testing**
- [ ] Lighthouse CI em pipeline
- [ ] WebPageTest para métricas reais
- [ ] Bundle analyzer reports
- [ ] Memory leak detection
- [ ] CPU profiling

#### **Load Testing**
- [ ] API endpoints sob carga
- [ ] Database performance
- [ ] Concurrent user simulation
- [ ] Memory usage monitoring

#### **User Experience Testing**
- [ ] Navegação em conexões lentas
- [ ] Comportamento offline
- [ ] Responsividade em dispositivos antigos
- [ ] Acessibilidade mantida

### 📊 **Monitoramento de Performance**

```typescript
// Performance Monitor
class PerformanceMonitor {
  static measureRender(componentName: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = function(...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();
        
        console.log(`${componentName}.${propertyKey} took ${end - start}ms`);
        
        // Send to analytics
        if (end - start > 100) {
          analytics.track('slow_render', {
            component: componentName,
            method: propertyKey,
            duration: end - start
          });
        }
        
        return result;
      };
    };
  }
  
  static trackBundleSize() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      analytics.track('bundle_load', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    }
  }
}
```

### 📊 **Métricas de Sucesso**

#### **Performance**
- **FCP**: < 1.5s (atual: ~3s)
- **LCP**: < 2.5s (atual: ~4s)
- **TTI**: < 3s (atual: ~5s)
- **Bundle**: < 500KB (atual: ~2MB)

#### **User Experience**
- **Bounce Rate**: Redução de 25%
- **Session Duration**: Aumento de 30%
- **Page Views**: Aumento de 20%
- **User Satisfaction**: Score > 4.3/5

### 🚀 **Implementação Faseada**

#### **Fase 1**: Bundle Optimization (1.5h)
- Configurar code splitting
- Implementar lazy loading de rotas
- Otimizar configuração do bundler

#### **Fase 2**: Component Optimization (2h)
- Adicionar React.memo estratégico
- Implementar useMemo/useCallback
- Configurar virtualização de listas

#### **Fase 3**: Cache Implementation (1h)
- Configurar Service Worker
- Implementar cache de API
- Adicionar offline strategies

#### **Fase 4**: Image Optimization (1h)
- Implementar lazy loading
- Configurar WebP com fallback
- Adicionar progressive loading

#### **Fase 5**: Backend Optimization (0.5h)
- Otimizar queries EF Core
- Configurar compression
- Implementar memory cache

### 📝 **Best Practices Implementadas**

#### **React Performance**
- Evitar inline objects/functions em props
- Usar keys estáveis em listas
- Implementar shouldComponentUpdate logic
- Minimizar re-renders desnecessários

#### **Bundle Optimization**
- Tree shaking habilitado
- Dynamic imports para código condicional
- Vendor chunks separados
- Polyfills apenas quando necessários

#### **Network Optimization**
- HTTP/2 server push
- Resource hints (preload, prefetch)
- CDN para assets estáticos
- Compression (Brotli > Gzip)

### 🔗 **Dependências**

#### **Frontend**
- React 18+ (Concurrent Features)
- React Window (Virtualization)
- Workbox (Service Worker)
- Web Vitals (Monitoring)

#### **Backend**
- EF Core 7+ (Performance improvements)
- Response Compression Middleware
- Memory Cache
- Application Insights

### ⚠️ **Riscos e Mitigações**

- **Risco**: Over-optimization prematura
  - **Mitigação**: Focar em bottlenecks reais medidos

- **Risco**: Complexidade de cache invalidation
  - **Mitigação**: Estratégias simples, TTL conservador

- **Risco**: Breaking changes em lazy loading
  - **Mitigação**: Testes abrangentes, rollback plan

- **Risco**: Memory leaks com memoization
  - **Mitigação**: Profiling regular, cleanup adequado

### 🔄 **Monitoramento Contínuo**

```typescript
// Continuous Performance Monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'largest-contentful-paint') {
      analytics.track('lcp', { value: entry.startTime });
    }
    
    if (entry.entryType === 'first-input') {
      analytics.track('fid', { value: entry.processingStart - entry.startTime });
    }
  });
});

performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
```

---

**Criado em**: Janeiro 2025  
**Última atualização**: Janeiro 2025  
**Versão**: 1.0