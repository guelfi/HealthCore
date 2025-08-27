# 📊 Implementação da Integração de Métricas - MobileMed Dashboard

## 🎯 Objetivo

Integrar os dados de métricas do dashboard no frontend React consumindo os endpoints reais da API .NET Core 8, substituindo os dados mockados por dados reais para os cards superiores do dashboard de administradores e médicos.

## 📋 Escopo da Implementação

### Cards do Dashboard a serem Integrados

#### Dashboard Administrativo (7 cards totais - 4 superiores)
- ✅ **Total de Médicos**: `metrics.totalMedicos`
- ✅ **Total de Pacientes**: `metrics.totalPacientes`  
- ✅ **Total de Exames**: `metrics.totalExames`
- ✅ **Crescimento Mensal de Exames**: `metrics.examesPorPeriodo`

#### Dashboard Médico (6 cards totais - 4 superiores)
- ✅ **Meus Pacientes**: Dados específicos do médico logado
- ✅ **Meus Exames**: Exames realizados pelo médico
- ✅ **Exames Este Mês**: Filtro temporal
- ✅ **Crescimento**: Evolução dos dados do médico

## 🏗️ Arquitetura da Solução

### Endpoints da API
```
GET /admin/metrics   - Métricas administrativas (requer role Admin)
GET /medico/metrics  - Métricas específicas do médico (requer role Médico)
```

### Estrutura de Dados

#### Backend Response (AdminMetricsDto)
```csharp
public class AdminMetricsDto
{
    public int TotalUsuarios { get; set; }
    public int TotalMedicos { get; set; }
    public int TotalAdministradores { get; set; }
    public int TotalPacientes { get; set; }
    public int TotalExames { get; set; }
    public List<PacientesPorMedicoDto> PacientesPorMedico { get; set; }
    public List<CrescimentoDto> CrescimentoBaseDados { get; set; }
    public List<ExamesPorPeriodoDto> ExamesPorPeriodo { get; set; }
}
```

#### Frontend Interface (DashboardMetrics)
```typescript
interface DashboardMetrics {
  usuarios: UsuarioMetrics;
  pacientes: PacienteMetrics;
  exames: ExameMetrics;
  crescimento: CrescimentoMetrics;
}
```

## 🔧 Componentes a serem Implementados

### 1. MetricsService
**Arquivo**: `src/Web/src/application/services/MetricsService.ts`

```typescript
class MetricsService {
  async getAdminMetrics(): Promise<DashboardMetrics>
  async getMedicoMetrics(): Promise<DashboardMetrics>
  private adaptAdminData(data: AdminMetricsDto): DashboardMetrics
  private adaptMedicoData(data: MedicoMetricsDto): DashboardMetrics
}
```

### 2. useMetrics Hook
**Arquivo**: `src/Web/src/presentation/hooks/useMetrics.ts`

```typescript
interface UseMetricsReturn {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
}
```

### 3. Data Adapters
**Funcionalidade**: Converter dados da API para interface do frontend

```typescript
// Backend → Frontend mapping
AdminMetricsDto.totalMedicos → DashboardMetrics.usuarios.usuariosPorPerfil.medicos
AdminMetricsDto.totalPacientes → DashboardMetrics.pacientes.totalPacientes
AdminMetricsDto.totalExames → DashboardMetrics.exames.totalExames
AdminMetricsDto.examesPorPeriodo → DashboardMetrics.crescimento.exames
```

## 🚀 Plano de Implementação

### Fase 1: Infraestrutura Base
1. **Criar MetricsService**
   - Implementar métodos para consumir APIs
   - Adicionar autenticação e error handling
   - Implementar cache básico

2. **Criar useMetrics Hook**
   - Gerenciar estado das métricas
   - Implementar loading states
   - Adicionar error handling

3. **Implementar Data Adapters**
   - Converter AdminMetricsDto → DashboardMetrics
   - Converter MedicoMetricsDto → DashboardMetrics
   - Garantir compatibilidade de tipos

### Fase 2: Atualização dos Componentes
1. **AdminDashboard.tsx**
   - Substituir `mockDashboardMetrics` por `useMetrics()`
   - Implementar loading states
   - Adicionar error boundaries

2. **MedicoDashboard.tsx** 
   - Implementar integração com dados reais
   - Ajustar cards para dados específicos do médico
   - Implementar filtros temporais

### Fase 3: Testing e Validação
1. **Testes de Integração**
   - Validar endpoint `/admin/metrics`
   - Validar endpoint `/medico/metrics`
   - Testar diferentes cenários de dados

2. **Validação Cross-Platform**
   - Testar comunicação macOS (backend) ↔ Windows (frontend)
   - Validar CORS e autenticação
   - Verificar performance

## 📊 Mapeamento de Dados

### Cards Superiores - Admin Dashboard

| Card | Fonte Backend | Campo Frontend |
|------|---------------|----------------|
| Total Médicos | `totalMedicos` | `usuarios.usuariosPorPerfil.medicos` |
| Total Pacientes | `totalPacientes` | `pacientes.totalPacientes` |
| Total Exames | `totalExames` | `exames.totalExames` |
| Crescimento Mensal | `examesPorPeriodo` | `crescimento.exames` |

### Cards Superiores - Médico Dashboard

| Card | Fonte Backend | Cálculo Frontend |
|------|---------------|------------------|
| Meus Pacientes | `numeroPacientes` | Direto do backend |
| Meus Exames | `totalExames` | Direto do backend |
| Exames Este Mês | `examesPorPaciente` | Filtro por data atual |
| Crescimento | `modalidadesMaisUtilizadas` | Tendência mensal |

## 🔒 Segurança e Autorização

### Role-Based Access
- **Administradores**: Acesso a `/admin/metrics` (todos os dados)
- **Médicos**: Acesso a `/medico/metrics` (dados específicos)

### JWT Token Management
- Usar `authStore` existente para tokens
- Implementar refresh automático
- Error handling para tokens expirados

## 🐛 Error Handling

### Cenários de Erro
1. **API indisponível**: Exibir fallback com dados em cache
2. **Token expirado**: Renovar automaticamente
3. **Dados inválidos**: Validar e usar valores padrão
4. **Rede instável**: Implementar retry logic

### Loading States
- Skeleton loading nos cards
- Progress indicators
- Mensagens de carregamento contextuais

## 📈 Critérios de Sucesso

### Funcionais
- ✅ Cards exibem dados reais da API
- ✅ Diferentes perfis recebem dados apropriados
- ✅ Loading states funcionando
- ✅ Error handling implementado

### Técnicos
- ✅ Performance adequada (<2s para carregar)
- ✅ Cache funcionando corretamente
- ✅ Compatibilidade cross-platform
- ✅ Testes de integração passando

### UX
- ✅ Transições suaves entre estados
- ✅ Mensagens de erro claras
- ✅ Dados atualizados em tempo real
- ✅ Interface responsiva mantida

## 🔄 Processo de Desenvolvimento

### Controle de Tarefas
- Usar `integration_metrics_001.json` para acompanhar progresso
- Atualizar status com `update_metrics_task_status.ps1`
- Visualizar progresso com `view_metrics_session_status.ps1`

### Git Workflow
- Feature branch: `feature/dashboard-metrics-integration`
- Commits granulares por tarefa
- Pull request com review obrigatório

---

**Data de Criação**: 27/08/2025  
**Última Atualização**: 27/08/2025  
**Status**: Planejamento Concluído - Aguardando Aprovação para Implementação