-- Script para inserir usuário administrador 
-- Este script será executado automaticamente durante o build da API
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
    LOWER(HEX(RANDOMBLOB(16))), 
    'guelfi',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    1, -- Administrador (UserRole.Administrador = 1)
    1 -- Ativo
);

-- Verificar se o usuário foi inserido corretamente
SELECT 
    'Usuario admin criado:' as status, 
    Id,
    Username, 
    Role, 
    IsActive, 
    CreatedAt
FROM Users 
WHERE Username = 'guelfi';