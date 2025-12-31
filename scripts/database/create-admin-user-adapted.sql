-- Script adaptado para criar usuário administrador guelfi
-- Considerando a estrutura atual da tabela Users

-- Primeiro, verificar se o usuário já existe
SELECT 'Verificando usuários existentes...' as status;
SELECT Id, Username, Role, IsActive FROM Users;

-- Inserir o usuário administrador guelfi se não existir
INSERT OR IGNORE INTO Users (
    Id, 
    Username, 
    PasswordHash, 
    Role, 
    IsActive,
    CreatedAt
) VALUES (
    'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 
    'guelfi',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    1, -- Administrador (UserRole.Administrador = 1)
    1, -- Ativo
    datetime('now') -- Data de criação
);

-- Verificar se o usuário foi criado
SELECT 
    'Usuário admin guelfi criado:' as status, 
    Id,
    Username, 
    Role, 
    IsActive, 
    CreatedAt
FROM Users 
WHERE Username = 'guelfi';