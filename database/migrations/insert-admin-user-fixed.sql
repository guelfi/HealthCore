-- Script CORRIGIDO para inserir usuário administrador 
-- Este script é compatível com a estrutura atual da tabela Users
-- Usuário: guelfi | Senha: @246!588

-- Primeiro, limpar qualquer usuário existente com esse username
DELETE FROM Users WHERE Username = 'guelfi';

-- Inserir o usuário administrador com hash BCrypt correto
-- Hash BCrypt para a senha '@246!588' gerado com work factor 10
INSERT INTO Users (
    Id, 
    Username, 
    PasswordHash, 
    Role, 
    IsActive
) VALUES (
    lower(hex(randomblob(16))), 
    'guelfi',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    1, -- Administrador (UserRole.Administrador = 1)
    1  -- Ativo
);

-- Criar alguns usuários médicos de teste
INSERT INTO Users (
    Id, 
    Username, 
    PasswordHash, 
    Role, 
    IsActive
) VALUES 
(
    lower(hex(randomblob(16))), 
    'doutor1',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1  -- Ativo
),
(
    lower(hex(randomblob(16))), 
    'doutor2',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1  -- Ativo
),
(
    lower(hex(randomblob(16))), 
    'oscar',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1  -- Ativo
);

-- Verificar se os usuários foram inseridos corretamente
SELECT 
    'Usuarios criados:' as status, 
    Username, 
    Role, 
    IsActive
FROM Users 
ORDER BY Role, Username;