-- Script para diagnosticar o estado das migrations no banco

-- 1. Verificar se existe tabela de lock de migrations
SELECT name FROM sqlite_master WHERE type='table' AND name='__EFMigrationsLock';

-- 2. Se existir, mostrar conteúdo da tabela de lock
SELECT * FROM __EFMigrationsLock;

-- 3. Mostrar todas as migrations aplicadas
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;

-- 4. Verificar estrutura atual da tabela Pacientes
SELECT sql FROM sqlite_master WHERE type='table' AND name='Pacientes';

-- 5. Verificar se já existe coluna MedicoId
PRAGMA table_info(Pacientes);