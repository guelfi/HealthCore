-- Atualizar o hash da senha para o usuário guelfi com um hash conhecido válido
-- O hash correto para a senha '@246!588' é $2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W

UPDATE Users 
SET PasswordHash = '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W'
WHERE Username = 'guelfi';

-- Verificar se a atualização foi feita
SELECT Id, Username, Role, IsActive, CreatedAt, PasswordHash FROM Users WHERE Username = 'guelfi';