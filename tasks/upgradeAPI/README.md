# Guia de Atualização da API - Módulo Médicos

## 📋 Visão Geral
Este guia contém todos os passos necessários para finalizar a implementação do módulo de médicos no macOS, incluindo a criação da migração do banco de dados e validações finais.

## ✅ Status Atual
- ✅ **Backend**: Entidade, DTOs, Service e Controller implementados
- ✅ **Frontend**: Interface, Service, Hook e Componentes implementados
- ⏳ **Migração**: Pendente (requer macOS com .NET SDK)
- ⏳ **Validação**: Pendente (após migração)

## 🎯 Objetivos
1. Criar migração do banco de dados para entidade Médico
2. Aplicar migração ao banco de dados
3. Validar funcionamento completo do CRUD
4. Testar integração frontend-backend

## 📂 Estrutura de Arquivos
```
tasks/upgradeAPI/
├── README.md                    # Este arquivo
├── MIGRATION_STEPS.md          # Passos detalhados da migração
├── VALIDATION_CHECKLIST.md     # Lista de validações
├── API_ENDPOINTS.md            # Documentação dos endpoints
└── TROUBLESHOOTING.md          # Solução de problemas
```

## 🚀 Passos de Execução

### 1. Pré-requisitos
- macOS com .NET SDK 8.0+ instalado
- Acesso ao repositório atualizado
- Banco de dados SQLite configurado

### 2. Ordem de Execução
1. **Migração** → `MIGRATION_STEPS.md`
2. **Validação** → `VALIDATION_CHECKLIST.md`
3. **Testes** → Endpoints e Frontend

### 3. Comandos Principais
```bash
# Navegar para o diretório da API
cd src/Api

# Criar migração
dotnet ef migrations add AddMedicoEntity

# Aplicar migração
dotnet ef database update

# Executar API
dotnet run
```

## 📝 Notas Importantes
- A entidade Médico já está configurada no DbContext
- Todos os endpoints estão mapeados no Program.cs
- O frontend está preparado para consumir a API
- Validações de duplicidade estão implementadas

## 🔗 Arquivos Relacionados
- `src/Api/Core/Domain/Entities/Medico.cs`
- `src/Api/Core/Application/Services/MedicoService.cs`
- `src/Api/Infrastructure/Data/MobileMedDbContext.cs`
- `src/Web/src/presentation/pages/admin/MedicosPageTable.tsx`

## 📞 Suporte
Em caso de problemas, consulte o arquivo `TROUBLESHOOTING.md` ou revise os logs da aplicação.