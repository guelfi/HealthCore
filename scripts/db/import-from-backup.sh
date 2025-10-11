#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DB_FILE="$ROOT_DIR/src/Api/database/healthcore.db"

LATEST_BACKUP="$(ls -1t "$ROOT_DIR"/src/Api/database/healthcore.backup_*.db 2>/dev/null | head -n1 || true)"

if [ -z "$LATEST_BACKUP" ]; then
  echo "Nenhum backup encontrado em $ROOT_DIR/src/Api/database/healthcore.backup_*.db"
  exit 0
fi

echo "Usando backup: $LATEST_BACKUP"

# Desabilitar FKs, anexar backup e copiar dados
sqlite3 "$DB_FILE" <<'SQL'
PRAGMA foreign_keys = OFF;

ATTACH DATABASE ':LATEST_BACKUP:' AS old;

-- Users
INSERT OR IGNORE INTO Users (Id, Username, PasswordHash, Role, IsActive, CreatedAt)
SELECT Id, Username, PasswordHash, Role, COALESCE(IsActive, 1), CreatedAt FROM old.Users;

-- Medicos
INSERT OR IGNORE INTO Medicos (Id, UserId, Nome, Documento, DataNascimento, Telefone, Email, Endereco, CRM, Especialidade, DataCriacao, EspecialidadeId)
SELECT Id, UserId, Nome, Documento, DataNascimento, Telefone, Email, Endereco, CRM, Especialidade, COALESCE(DataCriacao, datetime('now')), NULL FROM old.Medicos;

-- Pacientes
INSERT OR IGNORE INTO Pacientes (Id, Nome, DataNascimento, Documento, DataCriacao, MedicoId)
SELECT Id, Nome, DataNascimento, Documento, COALESCE(DataCriacao, datetime('now')), MedicoId FROM old.Pacientes;

-- Exames
INSERT OR IGNORE INTO Exames (Id, IdempotencyKey, Modalidade, DataCriacao, PacienteId, MedicoId)
SELECT Id, IdempotencyKey, Modalidade, COALESCE(DataCriacao, datetime('now')), PacienteId, MedicoId FROM old.Exames;

-- RefreshTokens
INSERT OR IGNORE INTO RefreshTokens (Id, Token, UserId, ExpiresAt, CreatedAt, IsRevoked, RevokedAt)
SELECT Id, Token, UserId, ExpiresAt, CreatedAt, COALESCE(IsRevoked, 0), RevokedAt FROM old.RefreshTokens;

-- BlacklistedTokens
INSERT OR IGNORE INTO BlacklistedTokens (Id, TokenId, ExpiresAt, BlacklistedAt, Reason)
SELECT Id, TokenId, ExpiresAt, BlacklistedAt, Reason FROM old.BlacklistedTokens;

DETACH DATABASE old;

PRAGMA foreign_keys = ON;
SQL

# Substituir placeholder do caminho do backup dentro do SQL executado acima
sqlite3 "$DB_FILE" "ATTACH DATABASE '$LATEST_BACKUP' AS old; DETACH DATABASE old;" >/dev/null 2>&1 || true

# Mapear Especialidade string -> EspecialidadeId por nome (case-insensitive, trim)
sqlite3 "$DB_FILE" "UPDATE Medicos SET EspecialidadeId = (SELECT e.Id FROM Especialidades e WHERE lower(trim(e.Nome)) = lower(trim(Medicos.Especialidade))) WHERE EspecialidadeId IS NULL AND length(trim(Especialidade)) > 0;"

echo "Importação e mapeamento concluídos."

# Contagens
echo -n "Contagens (Especialidades, Medicos, Pacientes, Exames): "
sqlite3 "$DB_FILE" "SELECT (SELECT COUNT(*) FROM Especialidades), (SELECT COUNT(*) FROM Medicos), (SELECT COUNT(*) FROM Pacientes), (SELECT COUNT(*) FROM Exames);"


