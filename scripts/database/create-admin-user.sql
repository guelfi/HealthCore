-- Script para criar usuário administrador no HealthCore
-- Usuário: guelfi
-- Senha: @246!588 (hash será atualizado pela API)

INSERT OR REPLACE INTO Users (
    Id, 
    Username, 
    PasswordHash, 
    Role, 
    IsActive, 
    CreatedAt, 
    UpdatedAt,
    CreatedBy,
    UpdatedBy
) VALUES (
    lower(hex(randomblob(16))), 
    'guelfi',
    '$2a$10$jF8ZyBnRmFLRqT5nfH4Gk.F4vWvYAoWdJvGK8zGzSJ8nFQnxJoJGu', -- Hash temporário para @246!588
    1, -- Administrador
    1, -- Ativo
    datetime('now'),
    datetime('now'),
    'system',
    'system'
);

-- Verificar se foi inserido
SELECT 'Admin criado:' as status, Username, Role, IsActive, CreatedAt
FROM Users 
WHERE Username = 'guelfi';