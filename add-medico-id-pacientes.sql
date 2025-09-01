-- Script para adicionar campo MedicoId na tabela Pacientes
-- Executar diretamente no banco SQLite

-- 1. Adicionar coluna MedicoId nullable na tabela Pacientes
ALTER TABLE Pacientes ADD COLUMN MedicoId TEXT;

-- 2. Criar índice para performance
CREATE INDEX IX_Pacientes_MedicoId ON Pacientes (MedicoId);

-- 3. Atualizar a tabela de migrações para marcar como aplicada
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
VALUES ('20250831200445_AddMedicoIdToPacientesNullable', '8.0.8');

-- 4. Verificar se a coluna foi criada
SELECT sql FROM sqlite_master WHERE type='table' AND name='Pacientes';