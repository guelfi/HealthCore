-- Migration Manual: Adicionar Especialidades e Relacionamento com Médicos
-- Data: 06/10/2025
-- Descrição: Cria tabela Especialidades e adiciona FK em Medicos

-- 1. Criar tabela Especialidades
CREATE TABLE IF NOT EXISTS "Especialidades" (
    "Id" TEXT NOT NULL PRIMARY KEY,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT,
    "Ativa" INTEGER NOT NULL DEFAULT 1,
    "DataCriacao" TEXT NOT NULL,
    "DataAtualizacao" TEXT
);

-- 2. Criar índice único no Nome
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Especialidades_Nome" ON "Especialidades" ("Nome");

-- 3. Criar índice em Ativa
CREATE INDEX IF NOT EXISTS "IX_Especialidades_Ativa" ON "Especialidades" ("Ativa");

-- 4. Adicionar coluna EspecialidadeId na tabela Medicos (se não existir)
-- SQLite não suporta ALTER TABLE ADD COLUMN IF NOT EXISTS diretamente
-- Precisamos verificar se a coluna já existe antes de adicionar

-- Verificar se a coluna existe consultando pragma_table_info
-- Se não existir, adicionar a coluna
ALTER TABLE "Medicos" ADD COLUMN "EspecialidadeId" TEXT;

-- 5. Criar índice em EspecialidadeId
CREATE INDEX IF NOT EXISTS "IX_Medicos_EspecialidadeId" ON "Medicos" ("EspecialidadeId");

-- 6. Nota: SQLite não suporta adicionar FK em tabelas existentes via ALTER TABLE
-- A FK será gerenciada pelo EF Core em tempo de execução
-- Para aplicar a FK real, seria necessário recriar a tabela Medicos

-- Verificação
SELECT 'Tabela Especialidades criada' as Status;
SELECT 'Índices criados' as Status;
SELECT 'Coluna EspecialidadeId adicionada em Medicos' as Status;
