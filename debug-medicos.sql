-- Script para debugar a situação dos médicos
-- Verificar usuários com role de médico que não têm registro na tabela Médicos

-- 1. Listar todos os usuários com role de médico
SELECT 
    u.Id as UserId,
    u.Username,
    u.Role,
    u.IsActive,
    u.CreatedAt
FROM Users u 
WHERE u.Role = 1; -- UserRole.Medico = 1

-- 2. Verificar se há médicos na tabela Médicos
SELECT COUNT(*) as TotalMedicos FROM Medicos;

-- 3. Listar médicos existentes
SELECT 
    m.Id,
    m.UserId,
    m.Nome,
    m.Documento,
    m.CRM,
    m.Especialidade,
    u.Username,
    u.IsActive
FROM Medicos m
LEFT JOIN Users u ON m.UserId = u.Id;

-- 4. Encontrar usuários médicos sem registro na tabela Médicos
SELECT 
    u.Id as UserId,
    u.Username,
    u.Role,
    u.IsActive,
    u.CreatedAt
FROM Users u 
LEFT JOIN Medicos m ON u.Id = m.UserId
WHERE u.Role = 1 AND m.Id IS NULL;