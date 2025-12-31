-- Script adaptado para popular o banco de dados HealthCore
-- Considerando a estrutura atual das tabelas

-- Primeiro, limpar dados existentes (exceto o usuário de teste)
DELETE FROM Pacientes;
DELETE FROM Medicos;
DELETE FROM Users WHERE Username != 'testuser';

-- Inserir usuários médicos de teste
INSERT INTO Users (
    Id, 
    Username, 
    PasswordHash, 
    Role, 
    IsActive,
    CreatedAt
) VALUES 
(
    '11111111-1111-1111-1111-111111111111', 
    'doutor1',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1, -- Ativo
    datetime('now') -- Data de criação
),
(
    '22222222-2222-2222-2222-222222222222', 
    'doutor2',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1, -- Ativo
    datetime('now') -- Data de criação
),
(
    '33333333-3333-3333-3333-333333333333', 
    'oscar',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1, -- Ativo
    datetime('now') -- Data de criação
);

-- Popular tabela de Médicos
INSERT INTO Medicos (
    Id,
    UserId,
    Nome,
    Documento,
    DataNascimento,
    Telefone,
    Email,
    Endereco,
    CRM,
    Especialidade,
    DataCriacao
)
SELECT 
    '44444444-4444-4444-4444-444444444444' as Id,
    u.Id as UserId,
    'Dr. João Silva' as Nome,
    '12345678901' as Documento,
    '1980-01-15' as DataNascimento,
    '(11) 99999-1111' as Telefone,
    'joao.silva@healthcore.com' as Email,
    'Rua das Flores, 123 - São Paulo/SP' as Endereco,
    'CRM/SP 123456' as CRM,
    'Cardiologia' as Especialidade,
    datetime('now') as DataCriacao
FROM Users u
WHERE u.Username = 'doutor1'

UNION ALL

SELECT 
    '55555555-5555-5555-5555-555555555555' as Id,
    u.Id as UserId,
    'Dr. Maria Santos' as Nome,
    '23456789012' as Documento,
    '1975-03-22' as DataNascimento,
    '(11) 99999-2222' as Telefone,
    'maria.santos@healthcore.com' as Email,
    'Av. Paulista, 456 - São Paulo/SP' as Endereco,
    'CRM/SP 234567' as CRM,
    'Pediatria' as Especialidade,
    datetime('now') as DataCriacao
FROM Users u
WHERE u.Username = 'doutor2'

UNION ALL

SELECT 
    '66666666-6666-6666-6666-666666666666' as Id,
    u.Id as UserId,
    'Dr. Oscar Pereira' as Nome,
    '34567890123' as Documento,
    '1982-07-10' as DataNascimento,
    '(11) 99999-3333' as Telefone,
    'oscar.pereira@healthcore.com' as Email,
    'Rua Oscar Freire, 789 - São Paulo/SP' as Endereco,
    'CRM/SP 345678' as CRM,
    'Ortopedia' as Especialidade,
    datetime('now') as DataCriacao
FROM Users u
WHERE u.Username = 'oscar';

-- Popular tabela de Pacientes
INSERT INTO Pacientes (
    Id,
    Nome,
    DataNascimento,
    Documento,
    DataCriacao,
    MedicoId
)
VALUES 
(
    '77777777-7777-7777-7777-777777777777',
    'Carlos Oliveira',
    '1985-05-15',
    '11122233344',
    datetime('now'),
    '44444444-4444-4444-4444-444444444444'  -- Dr. João Silva
),
(
    '88888888-8888-8888-8888-888888888888',
    'Ana Paula Silva',
    '1990-08-22',
    '22233344455',
    datetime('now'),
    '55555555-5555-5555-5555-555555555555'  -- Dr. Maria Santos
),
(
    '99999999-9999-9999-9999-999999999999',
    'Roberto Lima',
    '1978-12-10',
    '33344455566',
    datetime('now'),
    '66666666-6666-6666-6666-666666666666'  -- Dr. Oscar Pereira
);

-- Verificar resultados
.headers on
.mode table

SELECT '=== USUÁRIOS CRIADOS ===' as resultado;
SELECT Username, Role, IsActive, CreatedAt FROM Users ORDER BY Role, Username;

SELECT '=== MÉDICOS CRIADOS ===' as resultado;
SELECT m.Nome, m.CRM, m.Especialidade, u.Username 
FROM Medicos m 
INNER JOIN Users u ON m.UserId = u.Id 
ORDER BY m.Nome;

SELECT '=== PACIENTES CRIADOS ===' as resultado;
SELECT p.Nome, p.Documento, p.DataNascimento, m.Nome as Medico 
FROM Pacientes p 
INNER JOIN Medicos m ON p.MedicoId = m.Id
ORDER BY p.Nome;

SELECT '=== RESUMO FINAL ===' as resultado;
SELECT 
    (SELECT COUNT(*) FROM Users) as total_users,
    (SELECT COUNT(*) FROM Medicos) as total_medicos,
    (SELECT COUNT(*) FROM Pacientes) as total_pacientes,
    (SELECT COUNT(*) FROM Especialidades) as total_especialidades;