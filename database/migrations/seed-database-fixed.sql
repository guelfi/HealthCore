-- Script CORRIGIDO para popular base de dados HealthCore
-- Compatible com estrutura atual das tabelas
-- Data: 2025-09-16

-- ========================================
-- 1. LIMPAR DADOS EXISTENTES
-- ========================================
DELETE FROM Exames;
DELETE FROM Pacientes; 
DELETE FROM Medicos;
DELETE FROM Users;

-- ========================================
-- 2. INSERIR USUÁRIOS (ADMIN + MÉDICOS)
-- ========================================

-- Usuário Administrador
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

-- Usuários Médicos de teste
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
),
(
    lower(hex(randomblob(16))), 
    'antonio',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1  -- Ativo
),
(
    lower(hex(randomblob(16))), 
    'marta',
    '$2a$10$DFXp.AjTOH9t5W7RzWGbAOH9k6B4fG8kS1xM2YhN6vVzQ4C3E2O3W', -- Hash para @246!588
    2, -- Medico (UserRole.Medico = 2)
    1  -- Ativo
);

-- ========================================
-- 3. POPULAR TABELA MÉDICOS
-- ========================================
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
    Especialidade
)
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))) as Id,
    u.Id as UserId,
    CASE 
        WHEN u.Username = 'doutor1' THEN 'Dr. João Silva'
        WHEN u.Username = 'doutor2' THEN 'Dr. Maria Santos'
        WHEN u.Username = 'oscar' THEN 'Dr. Oscar Pereira'
        WHEN u.Username = 'antonio' THEN 'Dr. Antonio Costa'
        WHEN u.Username = 'marta' THEN 'Dra. Marta Oliveira'
        ELSE 'Dr. ' || u.Username
    END as Nome,
    CASE 
        WHEN u.Username = 'doutor1' THEN '12345678901'
        WHEN u.Username = 'doutor2' THEN '23456789012'
        WHEN u.Username = 'oscar' THEN '34567890123'
        WHEN u.Username = 'antonio' THEN '45678901234'
        WHEN u.Username = 'marta' THEN '56789012345'
        ELSE printf('%011d', abs(random()) % 100000000000)
    END as Documento,
    CASE 
        WHEN u.Username = 'doutor1' THEN '1980-01-15'
        WHEN u.Username = 'doutor2' THEN '1975-03-22'
        WHEN u.Username = 'oscar' THEN '1982-07-10'
        WHEN u.Username = 'antonio' THEN '1978-11-05'
        WHEN u.Username = 'marta' THEN '1985-09-18'
        ELSE '1980-01-01'
    END as DataNascimento,
    CASE 
        WHEN u.Username = 'doutor1' THEN '(11) 99999-1111'
        WHEN u.Username = 'doutor2' THEN '(11) 99999-2222'
        WHEN u.Username = 'oscar' THEN '(11) 99999-3333'
        WHEN u.Username = 'antonio' THEN '(11) 99999-4444'
        WHEN u.Username = 'marta' THEN '(11) 99999-5555'
        ELSE '(11) 99999-0000'
    END as Telefone,
    CASE 
        WHEN u.Username = 'doutor1' THEN 'doutor1@healthcore.com'
        WHEN u.Username = 'doutor2' THEN 'doutor2@healthcore.com'
        WHEN u.Username = 'oscar' THEN 'oscar@healthcore.com'
        WHEN u.Username = 'antonio' THEN 'antonio@healthcore.com'
        WHEN u.Username = 'marta' THEN 'marta@healthcore.com'
        ELSE u.Username || '@healthcore.com'
    END as Email,
    CASE 
        WHEN u.Username = 'doutor1' THEN 'Rua das Flores, 123 - São Paulo/SP'
        WHEN u.Username = 'doutor2' THEN 'Av. Paulista, 456 - São Paulo/SP'
        WHEN u.Username = 'oscar' THEN 'Rua Oscar Freire, 789 - São Paulo/SP'
        WHEN u.Username = 'antonio' THEN 'Rua Antonio Carlos, 321 - São Paulo/SP'
        WHEN u.Username = 'marta' THEN 'Av. Marta Silva, 654 - São Paulo/SP'
        ELSE 'Endereço não informado'
    END as Endereco,
    CASE 
        WHEN u.Username = 'doutor1' THEN 'CRM/SP 123456'
        WHEN u.Username = 'doutor2' THEN 'CRM/SP 234567'
        WHEN u.Username = 'oscar' THEN 'CRM/SP 345678'
        WHEN u.Username = 'antonio' THEN 'CRM/SP 456789'
        WHEN u.Username = 'marta' THEN 'CRM/SP 567890'
        ELSE 'CRM/SP ' || printf('%06d', abs(random()) % 999999)
    END as CRM,
    CASE 
        WHEN u.Username = 'doutor1' THEN 'Cardiologia'
        WHEN u.Username = 'doutor2' THEN 'Pediatria'
        WHEN u.Username = 'oscar' THEN 'Ortopedia'
        WHEN u.Username = 'antonio' THEN 'Neurologia'
        WHEN u.Username = 'marta' THEN 'Ginecologia'
        ELSE 'Clínica Geral'
    END as Especialidade
FROM Users u
WHERE u.Role = 2; -- UserRole.Medico = 2

-- ========================================
-- 4. POPULAR TABELA PACIENTES DE TESTE
-- ========================================
INSERT INTO Pacientes (
    Id,
    MedicoId,
    Nome,
    Documento,
    DataNascimento,
    Telefone,
    Email,
    Endereco,
    Observacoes
)
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))) as Id,
    m.Id as MedicoId,
    CASE 
        WHEN m.Nome = 'Dr. João Silva' THEN 'Carlos Oliveira'
        WHEN m.Nome = 'Dr. Maria Santos' THEN 'Ana Paula Silva' 
        WHEN m.Nome = 'Dr. Oscar Pereira' THEN 'Roberto Lima'
        WHEN m.Nome = 'Dr. Antonio Costa' THEN 'Fernanda Alves'
        WHEN m.Nome = 'Dra. Marta Oliveira' THEN 'Julia Santos'
        ELSE 'Paciente Teste'
    END as Nome,
    printf('%011d', abs(random()) % 100000000000) as Documento,
    CASE 
        WHEN m.Nome = 'Dr. João Silva' THEN '1985-05-15'
        WHEN m.Nome = 'Dr. Maria Santos' THEN '1990-08-22'
        WHEN m.Nome = 'Dr. Oscar Pereira' THEN '1978-12-10'
        WHEN m.Nome = 'Dr. Antonio Costa' THEN '1988-03-05'
        WHEN m.Nome = 'Dra. Marta Oliveira' THEN '1995-07-18'
        ELSE '1990-01-01'
    END as DataNascimento,
    '(11) 88888-' || printf('%04d', abs(random()) % 10000) as Telefone,
    lower(replace(
        CASE 
            WHEN m.Nome = 'Dr. João Silva' THEN 'carlos.oliveira'
            WHEN m.Nome = 'Dr. Maria Santos' THEN 'ana.silva'
            WHEN m.Nome = 'Dr. Oscar Pereira' THEN 'roberto.lima'
            WHEN m.Nome = 'Dr. Antonio Costa' THEN 'fernanda.alves'
            WHEN m.Nome = 'Dra. Marta Oliveira' THEN 'julia.santos'
            ELSE 'paciente.teste'
        END, ' ', '')) || '@email.com' as Email,
    'Rua Teste, 123 - São Paulo/SP' as Endereco,
    'Paciente de teste para sistema' as Observacoes
FROM Medicos m;

-- ========================================
-- 5. VERIFICAR RESULTADOS
-- ========================================
.headers on
.mode table

SELECT '=== USUÁRIOS CRIADOS ===' as resultado;
SELECT Username, Role, IsActive FROM Users ORDER BY Role, Username;

SELECT '=== MÉDICOS CRIADOS ===' as resultado;
SELECT m.Nome, m.CRM, m.Especialidade, u.Username 
FROM Medicos m 
INNER JOIN Users u ON m.UserId = u.Id 
ORDER BY m.Nome;

SELECT '=== PACIENTES CRIADOS ===' as resultado;
SELECT p.Nome, m.Nome as Medico, p.Email 
FROM Pacientes p 
INNER JOIN Medicos m ON p.MedicoId = m.Id
ORDER BY p.Nome;

SELECT '=== RESUMO FINAL ===' as resultado;
SELECT 
    (SELECT COUNT(*) FROM Users) as total_users,
    (SELECT COUNT(*) FROM Medicos) as total_medicos,
    (SELECT COUNT(*) FROM Pacientes) as total_pacientes,
    (SELECT COUNT(*) FROM Exames) as total_exames;