# 🗄️ Arquitetura de Dados - HealthCore

## 🎯 **Visão Geral**
O HealthCore utiliza uma **arquitetura de dados reais** 100% baseada em API, sem dados mockados ou simulados. Todos os dados são persistidos e consultados através de um banco de dados SQLite com Entity Framework Core 8.0.

---

## 🏗️ **Arquitetura Atual**

### **📊 Características Principais**
- ✅ **Zero Mock Data**: Nenhum dado fictício ou simulado
- ✅ **Dados Persistentes**: SQLite com Entity Framework Core 8.0 
- ✅ **API-First**: Todas as operações através de endpoints REST
- ✅ **Idempotência**: Operações críticas garantem consistência
- ✅ **Transações ACID**: Integridade dos dados médicos

### **🗃️ Modelo de Dados**

#### **Entidades Principais:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Paciente  │    │    Exame    │    │   Médico    │
│             │    │             │    │             │
│ - Id        │◄──►│ - Id        │    │ - Id        │
│ - Nome      │    │ - Modalidade│    │ - Nome      │
│ - Documento │    │ - PacienteId│◄───┤ - CRM       │
│ - DataNasc  │    │ - IdempKey  │    │ - Especialid│
│ - MedicoId  │────┤ - DataCriacao│    │ - DataCriacao│
└─────────────┘    └─────────────┘    └─────────────┘
```

#### **Entidades de Segurança:**
```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│    User     │    │ RefreshToken │    │ BlacklistedToken│
│             │    │              │    │                 │
│ - Id        │◄──►│ - Id         │    │ - Id            │
│ - Username  │    │ - Token      │    │ - TokenId       │
│ - PassHash  │    │ - UserId     │    │ - ExpiresAt     │
│ - Role      │    │ - ExpiresAt  │    │ - Reason        │
│ - IsActive  │    │ - IsRevoked  │    └─────────────────┘
└─────────────┘    └──────────────┘
```

### **🔧 Configuração Técnica**

#### **Database Context:**
```csharp
public class HealthCoreDbContext : DbContext
{
    public virtual DbSet<Paciente> Pacientes { get; set; }
    public virtual DbSet<Exame> Exames { get; set; }
    public virtual DbSet<Medico> Medicos { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
    public virtual DbSet<BlacklistedToken> BlacklistedTokens { get; set; }
}
```

#### **Connection String:**
- **Provider**: SQLite
- **Arquivo**: `healthcore.db` (será renomeado para `healthcore.db`)
- **Localização**: `src/Api/`

---

## 🔄 **Fluxo de Dados**

### **1. Operações CRUD**
```
Frontend (React) 
    ↓ HTTP Request
API Controllers 
    ↓ Service Layer
Application Services
    ↓ Entity Framework
SQLite Database
```

### **2. Autenticação e Autorização**
```
Login Request
    ↓ JWT Generation
User Service
    ↓ Token Validation
JWT Middleware
    ↓ Claims
Authorized Endpoints
```

### **3. Health Checks**
```
Health Check Endpoint
    ↓ Database Check
EF Core Connection
    ↓ Performance Check
Response Time Validation
    ↓ Result
Health Status (Healthy/Degraded/Unhealthy)
```

---

## 🚀 **Vantagens da Arquitetura Atual**

### **✅ Benefícios Técnicos:**
1. **Dados Reais**: Zero simulação, comportamento real em desenvolvimento
2. **Performance Real**: Métricas e benchmarks precisos
3. **Testes Realísticos**: Cenários baseados em dados reais
4. **Debugging Eficaz**: Problemas identificáveis em ambiente real
5. **Consistência**: Mesmo comportamento dev/staging/prod

### **✅ Benefícios para Desenvolvimento:**
1. **Produtividade**: Desenvolvimento direto contra API real
2. **Qualidade**: Bugs identificados cedo no ciclo
3. **Confiabilidade**: Sistema testado com dados reais
4. **Manutenibilidade**: Código mais limpo sem mocks complexos

### **✅ Benefícios Médicos:**
1. **Conformidade**: Dados reais seguem padrões médicos
2. **Auditoria**: Trilha completa de operações
3. **LGPD**: Implementação real de proteção de dados
4. **Idempotência**: Operações médicas seguras

---

## 📊 **Monitoramento e Observabilidade**

### **Health Checks Implementados:**
- ✅ **Database**: Conectividade e performance do banco
- ✅ **Filesystem**: Espaço em disco e acesso a logs
- ✅ **Memory**: Uso de memória da aplicação
- ✅ **Application Startup**: Status de inicialização

### **Logging Estruturado:**
```
Serilog Configuration:
- Console Output (Development)
- File Rotation (../log/healthcore-.log)
- Environment Enrichment
- Structured JSON Format
```

---

## 🔒 **Segurança dos Dados**

### **Autenticação:**
- JWT Tokens com HS256
- Refresh Tokens seguros
- Token Blacklisting
- Claims-based Authorization

### **Autorização:**
- Role-based Access Control
- User activation/deactivation  
- Protected endpoints
- CORS configurado

### **Proteção de Dados:**
- Hashing de senhas (BCrypt)
- Validação de entrada
- Sanitização de dados
- Conformidade LGPD

---

## 📈 **Performance e Escalabilidade**

### **Otimizações Atuais:**
- Memory Caching para consultas frequentes
- Índices únicos no banco (Documento, CRM, Username)
- Connection pooling do Entity Framework
- Lazy loading configurado

### **Métricas Monitoradas:**
- Tempo de resposta das APIs
- Uso de memória da aplicação
- Performance de queries
- Health check timings

---

## 🔄 **Migrations e Versionamento**

### **Estado Atual:**
- ✅ Migration `MigrarUsuariosMedicos`: Dados base do sistema
- ✅ Estrutura completa de entidades
- ✅ Relacionamentos configurados
- ✅ Índices e constraints aplicados

### **Processo de Migration:**
```bash
# Aplicar migrations
dotnet ef database update --project src/Api/HealthCore.Api.csproj

# Criar nova migration
dotnet ef migrations add NomeDaMigration --project src/Api/HealthCore.Api.csproj
```

---

## 🎯 **Próximos Passos**

### **Melhorias Planejadas:**
1. **Renomear Database**: `healthcore.db` → `healthcore.db`
2. **Cache Distribuído**: Migrar para Redis
3. **Database Sharding**: Para alta escala
4. **Read Replicas**: Separar leitura/escrita
5. **Database Monitoring**: APM específico para banco

### **Observabilidade Avançada:**
1. **Query Performance**: Análise detalhada de consultas
2. **Index Usage**: Otimização de índices
3. **Connection Pool**: Monitoramento de conexões
4. **Transaction Monitoring**: Análise de transações

---

## 🏆 **Conclusão**

A arquitetura de dados do HealthCore representa um **modelo maduro e profissional** para sistemas médicos, com:

- ✅ **Zero Mock Data** - Comportamento real desde desenvolvimento
- ✅ **Dados Persistentes** - SQLite + Entity Framework Core 8.0  
- ✅ **API-First** - Todas operações via endpoints REST
- ✅ **Segurança Robusta** - JWT, RBAC, LGPD compliance
- ✅ **Monitoramento Completo** - Health checks e observabilidade

Esta arquitetura fornece uma **base sólida** para crescimento e evolução do sistema, mantendo sempre dados reais e comportamento consistente.

---

**📅 Documento criado**: 16 de Setembro de 2025  
**🔄 Última atualização**: 16 de Setembro de 2025  
**📊 Status**: Sistema em produção com dados reais