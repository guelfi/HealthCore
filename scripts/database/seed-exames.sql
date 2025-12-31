-- Script para adicionar exames médicos ao banco de dados HealthCore

-- Primeiro, vamos verificar os IDs dos pacientes e médicos existentes
.headers on
.mode table
SELECT 'Pacientes existentes:' as info;
SELECT Id, Nome FROM Pacientes;

SELECT 'Médicos existentes:' as info;
SELECT Id, Nome FROM Medicos;

-- Inserir exames médicos
INSERT INTO Exames (
    Id,
    IdempotencyKey,
    Modalidade,
    DataCriacao,
    PacienteId,
    MedicoId
)
VALUES 
(
    'A1A1A1A1-A1A1-A1A1-A1A1-A1A1A1A1A1A1',
    'exam-001-ct-torax',
    1, -- CT (Tomografia Computadorizada)
    datetime('now'),
    '77777777-7777-7777-7777-777777777777', -- Carlos Oliveira
    '44444444-4444-4444-4444-444444444444'  -- Dr. João Silva
),
(
    'B2B2B2B2-B2B2-B2B2-B2B2-B2B2B2B2B2B2',
    'exam-002-mr-cranio',
    2, -- MR (Ressonância Magnética)
    datetime('now'),
    '88888888-8888-8888-8888-888888888888', -- Ana Paula Silva
    '55555555-5555-5555-5555-555555555555'  -- Dr. Maria Santos
),
(
    'C3C3C3C3-C3C3-C3C3-C3C3-C3C3C3C3C3C3',
    'exam-003-us-abdomen',
    3, -- US (Ultrassonografia)
    datetime('now'),
    '99999999-9999-9999-9999-999999999999', -- Roberto Lima
    '66666666-6666-6666-6666-666666666666'  -- Dr. Oscar Pereira
),
(
    'D4D4D4D4-D4D4-D4D4-D4D4-D4D4D4D4D4D4',
    'exam-004-dx-torax',
    4, -- DX (Radiografia)
    datetime('now'),
    '77777777-7777-7777-7777-777777777777', -- Carlos Oliveira
    '44444444-4444-4444-4444-444444444444'  -- Dr. João Silva
);

-- Verificar os exames criados
SELECT '=== EXAMES CRIADOS ===' as resultado;
SELECT 
    e.Id,
    e.IdempotencyKey,
    CASE 
        WHEN e.Modalidade = 1 THEN 'CT (Tomografia)'
        WHEN e.Modalidade = 2 THEN 'MR (Ressonância)'
        WHEN e.Modalidade = 3 THEN 'US (Ultrassom)'
        WHEN e.Modalidade = 4 THEN 'DX (Radiografia)'
        WHEN e.Modalidade = 5 THEN 'MG (Mamografia)'
        WHEN e.Modalidade = 6 THEN 'RF (Fluoroscopia)'
        ELSE 'Outro'
    END as Modalidade,
    e.DataCriacao,
    p.Nome as Paciente,
    m.Nome as Medico
FROM Exames e
INNER JOIN Pacientes p ON e.PacienteId = p.Id
INNER JOIN Medicos m ON e.MedicoId = m.Id
ORDER BY e.DataCriacao;

-- Resumo final
SELECT '=== RESUMO FINAL COM EXAMES ===' as resultado;
SELECT 
    (SELECT COUNT(*) FROM Users) as total_users,
    (SELECT COUNT(*) FROM Medicos) as total_medicos,
    (SELECT COUNT(*) FROM Pacientes) as total_pacientes,
    (SELECT COUNT(*) FROM Especialidades) as total_especialidades,
    (SELECT COUNT(*) FROM Exames) as total_exames,
    (SELECT COUNT(*) FROM RefreshTokens) as total_refresh_tokens;