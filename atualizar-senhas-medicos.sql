-- Script para atualizar senhas de todos os médicos para "@246!588"
-- INSTRUÇÕES:
-- 1. Execute a API: dotnet run
-- 2. Acesse: http://localhost:5000/temp/gerar-hash-senha
-- 3. Copie o comando SQL gerado
-- 4. Execute o comando SQL no SQLite

-- Primeiro, vamos ver os médicos atuais
SELECT 'MÉDICOS ATUAIS:' as Status;
SELECT 
    u.Id,
    u.Username,
    u.Role,
    m.Nome as NomeMedico,
    m.CRM
FROM Users u
INNER JOIN Medicos m ON u.Id = m.UserId
WHERE u.Role = 2
ORDER BY u.Username;

-- Após obter o hash do endpoint /temp/gerar-hash-senha, execute:
-- UPDATE Users SET PasswordHash = 'HASH_GERADO_AQUI' WHERE Role = 2;

-- Verificar resultado após a atualização
-- SELECT 'SENHAS ATUALIZADAS:' as Status;
-- SELECT 
--     u.Username,
--     'Senha atualizada para @246!588' as Status
-- FROM Users u
-- WHERE u.Role = 2
-- ORDER BY u.Username;