# 🔗 Análise de Integração Backend-Frontend - MobileMed

## 📋 Resumo Executivo

Esta análise identifica os pontos críticos de integração entre o backend .NET Core 8 e o frontend React + Vite do sistema MobileMed. O frontend está bem estruturado seguindo Clean Architecture, mas atualmente utiliza dados mockados que precisam ser substituídos por integrações reais com a API.

## 🎯 Pontos de Integração Identificados

### 1. 🔐 Sistema de Autenticação

**Arquivo:** `src/Web/src/application/stores/authStore.ts`  
**Prioridade:** 🔴 Alta

#### Estado Atual
```typescript
const mockLogin = async (credentials: LoginDto): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const user = mockUsers.find(u => u.username === credentials.username);
  
  if (!user || credentials.password !== '123456') {
    throw new Error('Credenciais inválidas');
  }
  
  return {
    token: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    user,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
};
```

#### Integração Necessária
- **Endpoint Backend:** `POST /auth/login`
- **Endpoint Backend:** `POST /auth/refresh`
- **Endpoint Backend:** `POST /auth/logout`

#### Implementação Sugerida
```typescript
const login = async (credentials: LoginDto) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

const refreshAuth = async () => {
  const { refreshToken } = get();
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
};

const logout = async () => {
  await apiClient.post('/auth/logout');
  // Limpar estado local
};
```

---

### 2. 👥 Gestão de Pacientes

**Arquivo:** `src/Web/src/presentation/pages/PacientesPage.tsx`  
**Prioridade:** 🔴 Alta

#### Estado Atual
```typescript
const [pacientes] = useState<Paciente[]>(mockPacientes);
```

#### Integração Necessária
- **Endpoint Backend:** `GET /pacientes?page={page}&pageSize={pageSize}`
- **Endpoint Backend:** `POST /pacientes`
- **Endpoint Backend:** `PUT /pacientes/{id}`
- **Endpoint Backend:** `DELETE /pacientes/{id}`

#### Service Necessário
```typescript
const usePacientes = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPacientes = async (page: number, pageSize: number) => {
    setLoading(true);
    const response = await apiClient.get(`/pacientes?page=${page}&pageSize=${pageSize}`);
    setPacientes(response.data);
    setLoading(false);
  };

  const createPaciente = async (data: CreatePacienteDto) => {
    const response = await apiClient.post('/pacientes', data);
    return response.data;
  };

  const updatePaciente = async (id: string, data: UpdatePacienteDto) => {
    const response = await apiClient.put(`/pacientes/${id}`, data);
    return response.data;
  };

  const deletePaciente = async (id: string) => {
    await apiClient.delete(`/pacientes/${id}`);
  };

  return { 
    pacientes, 
    loading, 
    fetchPacientes, 
    createPaciente, 
    updatePaciente, 
    deletePaciente 
  };
};
```

---

### 3. 🔬 Gestão de Exames

**Arquivo:** `src/Web/src/presentation/pages/ExamesPage.tsx`  
**Prioridade:** 🔴 Alta

#### Estado Atual
```typescript
const [exames] = useState<Exame[]>(mockExames);
const [pacientes] = useState<Paciente[]>(mockPacientes);
```

#### Integração Necessária
- **Endpoint Backend:** `GET /exames?page={page}&pageSize={pageSize}`
- **Endpoint Backend:** `POST /exames`
- **Endpoint Backend:** `PUT /exames/{id}`
- **Endpoint Backend:** `DELETE /exames/{id}`

#### Considerações Especiais
- **Idempotência:** Gerar `idempotencyKey` automaticamente se não fornecida
- **Validação:** Verificar se paciente existe antes de criar exame
- **Modalidades DICOM:** Usar enums corretos do backend

#### Service Necessário
```typescript
const useExames = () => {
  const [exames, setExames] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(false);

  const createExame = async (data: CreateExameDto) => {
    const exameData = {
      ...data,
      idempotencyKey: data.idempotencyKey || `exam-${Date.now()}-${Math.random()}`
    };
    const response = await apiClient.post('/exames', exameData);
    return response.data;
  };

  // ... outros métodos
};
```

---

### 4. 👨‍⚕️ Gestão de Médicos/Usuários

**Arquivo:** `src/Web/src/presentation/pages/MedicosPage.tsx`  
**Prioridade:** 🟡 Média

#### Estado Atual
```typescript
const [medicos] = useState<Usuario[]>(
  mockUsuarios.filter(u => u.role === UserProfile.MEDICO)
);
```

#### Integração Necessária
- **Endpoint Backend:** `GET /admin/usuarios?page={page}&pageSize={pageSize}`
- **Endpoint Backend:** `POST /admin/usuarios`
- **Endpoint Backend:** `PUT /admin/usuarios/{id}`
- **Endpoint Backend:** `DELETE /admin/usuarios/{id}`
- **Endpoint Backend:** `PATCH /admin/usuarios/{id}/ativar`

#### Considerações Especiais
- **Autorização:** Requer perfil Administrador
- **Filtros:** Filtrar usuários por role no frontend ou backend

---

### 5. 📊 Dashboard e Métricas

**Arquivo:** `src/Web/src/application/stores/mockData.ts`  
**Prioridade:** 🟡 Média

#### Estado Atual
```typescript
export const mockDashboardMetrics: DashboardMetrics = {
  usuarios: { totalUsuarios: 4, /* ... */ },
  pacientes: { totalPacientes: 5, /* ... */ },
  exames: { totalExames: 6, /* ... */ },
  // ...dados mockados
};
```

#### Integração Necessária
- **Endpoint Backend:** `GET /admin/metrics` (para administradores)
- **Endpoint Backend:** `GET /medico/metrics` (para médicos)

#### Service Necessário
```typescript
const useMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const { user } = useAuthStore();

  const fetchMetrics = async () => {
    let endpoint = '/admin/metrics';
    
    if (user?.role === UserProfile.MEDICO) {
      endpoint = '/medico/metrics';
    }
    
    const response = await apiClient.get(endpoint);
    setMetrics(response.data);
  };

  return { metrics, fetchMetrics };
};
```

---

### 6. 🔗 Cliente da API - Melhorias

**Arquivo:** `src/Web/src/infrastructure/api/client.ts`  
**Prioridade:** 🔴 Alta

#### Melhorias Necessárias

##### Integração com Auth Store
```typescript
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Usar token do Zustand store
    const authState = JSON.parse(localStorage.getItem('auth-store') || '{}');
    const token = authState?.state?.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

##### Refresh Token Automático
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const authState = JSON.parse(localStorage.getItem('auth-store') || '{}');
      const refreshToken = authState?.state?.refreshToken;
      
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh', { refreshToken });
          // Atualizar token no store
          // Repetir requisição original
          return apiClient(originalRequest);
        } catch {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

## ⚠️ Inconsistências Identificadas

### 1. Nomenclatura de Campos

| Entidade | Backend | Frontend | Ação Necessária |
|----------|---------|----------|-----------------|
| Paciente | `documento` | `cpf` | Padronizar para `documento` |
| Paciente | `DataNascimento` | `dataNascimento` | Manter camelCase no frontend |

### 2. Modalidades DICOM

**Backend:** `CR, CT, DX, MG, MR, NM, OT, PT, RF, US, XA`  
**Frontend:** `CT, MR, XR, US, MG, CR, DX, NM`  

**Ações:**
- Adicionar modalidades faltantes: `OT, PT, RF, XA`
- Corrigir `XR` para `DX` ou `CR`
- Atualizar enum `ModalidadeDicom`

### 3. Estrutura de Resposta

**Backend:** Retorna arrays simples  
**Frontend:** Espera objetos com paginação  

**Solução:** Criar DTOs de resposta com metadados de paginação

---

## 🛠️ Plano de Implementação

### Fase 1: Autenticação (Sprint 1)
- [ ] Integrar login real
- [ ] Implementar refresh token
- [ ] Configurar interceptadores
- [ ] Testar fluxo completo de auth

### Fase 2: CRUD Básico (Sprint 2)
- [ ] Service de Pacientes
- [ ] Service de Exames com idempotência
- [ ] Formulários funcionais
- [ ] Validações integradas

### Fase 3: Administração (Sprint 3)
- [ ] Service de Usuários
- [ ] Controle de permissões
- [ ] Funcionalidades administrativas

### Fase 4: Dashboard e Métricas (Sprint 4)
- [ ] Integração de métricas
- [ ] Gráficos em tempo real
- [ ] Relatórios específicos por perfil

### Fase 5: Refinamentos (Sprint 5)
- [ ] Tratamento de erros robusto
- [ ] Loading states globais
- [ ] Testes de integração
- [ ] Otimizações de performance

---

## 📁 Arquivos Críticos para Modificação

### 🔴 Alta Prioridade
1. `src/Web/src/application/stores/authStore.ts` - Sistema de autenticação
2. `src/Web/src/infrastructure/api/client.ts` - Cliente HTTP
3. `src/Web/src/presentation/pages/PacientesPage.tsx` - CRUD de pacientes
4. `src/Web/src/presentation/pages/ExamesPage.tsx` - CRUD de exames

### 🟡 Média Prioridade
5. `src/Web/src/presentation/pages/MedicosPage.tsx` - CRUD de usuários
6. `src/Web/src/application/stores/mockData.ts` - Remover dados mock
7. `src/Web/src/domain/entities/` - Ajustar interfaces
8. `src/Web/src/domain/enums/ModalidadeDicom.ts` - Corrigir modalidades

### 🟢 Baixa Prioridade
9. Componentes de dashboard
10. Testes unitários
11. Documentação de APIs
12. Otimizações de performance

---

## 🧪 Estratégia de Testes

### Testes de Integração
- [ ] Fluxo completo de autenticação
- [ ] CRUD de cada entidade
- [ ] Tratamento de erros da API
- [ ] Refresh token automático

### Testes Unitários
- [ ] Services de API
- [ ] Stores Zustand
- [ ] Componentes críticos
- [ ] Hooks customizados

### Testes E2E
- [ ] Login e navegação
- [ ] Criação de pacientes e exames
- [ ] Funcionalidades administrativas

---

## 📊 Métricas de Sucesso

### Funcionalidades
- [ ] 100% dos dados mock substituídos
- [ ] Autenticação JWT funcional
- [ ] CRUD completo para todas entidades
- [ ] Dashboard com dados reais

### Performance
- [ ] Tempo de carregamento < 2s
- [ ] Refresh token transparente
- [ ] Tratamento de erros consistente

### Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Zero vulnerabilidades críticas
- [ ] Lint sem warnings

---

## 🚀 Considerações Técnicas

### Configuração de Ambiente
```bash
# Variáveis de ambiente necessárias
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_VERSION=1.0.0
```

### CORS Configuration
O backend já está configurado para aceitar requisições do frontend em:
- `http://localhost:5005`
- `http://127.0.0.1:5005`
- `http://0.0.0.0:5005`
- `http://192.168.15.119:5005`

### JWT Token Management
- Tokens são armazenados no Zustand store
- Refresh automático implementado nos interceptadores
- Logout limpa todos os dados de autenticação

---

## 📝 Próximos Passos

1. **Revisar** esta análise com a equipe
2. **Criar tasks** específicas para cada ponto de integração
3. **Definir** cronograma de implementação
4. **Configurar** ambiente de desenvolvimento integrado
5. **Iniciar** pela implementação da autenticação

---

*Documento gerado em: `{Date.now()}`*  
*Versão: 1.0*  
*Autor: Análise Técnica Automatizada*