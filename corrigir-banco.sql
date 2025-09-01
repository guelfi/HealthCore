-- Script para corrigir o banco e aplicar a migração pendente

-- 1. Limpar qualquer lock de migração
DELETE FROM __EFMigrationsLock;

-- 2. Adicionar coluna MedicoId nullable na tabela Pacientes
ALTER TABLE Pacientes ADD COLUMN MedicoId TEXT;

-- 3. Criar índice para performance
CREATE INDEX IX_Pacientes_MedicoId ON Pacientes (MedicoId);

-- 4. Marcar a migração como aplicada
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) 
VALUES ('20250831200445_AddMedicoIdToPacientesNullable', '9.0.8');

-- 5. Verificar se tudo foi aplicado corretamente
PRAGMA table_info(Pacientes);

-- 6. Mostrar migrations aplicadas
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId;