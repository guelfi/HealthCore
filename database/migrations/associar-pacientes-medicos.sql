-- Script para associar pacientes sem médico a médicos existentes
-- Resolve o problema de pacientes órfãos (sem MedicoId)

-- 1. Primeiro, vamos ver a situação atual
SELECT 'SITUAÇÃO ATUAL:' as Status;
SELECT 
    'Pacientes sem médico: ' || COUNT(*) as Info
FROM Pacientes 
WHERE MedicoId IS NULL;

SELECT 
    'Total de médicos disponíveis: ' || COUNT(*) as Info
FROM Medicos;

-- 2. Listar pacientes sem médico
SELECT 
    Id,
    Nome,
    Documento,
    DataNascimento,
    MedicoId
FROM Pacientes 
WHERE MedicoId IS NULL
ORDER BY DataCriacao;

-- 3. Listar médicos disponíveis para associação
SELECT 
    Id,
    Nome,
    CRM,
    Especialidade
FROM Medicos
ORDER BY DataCriacao;

-- 4. Associar pacientes sem médico aos médicos existentes
-- Estratégia: distribuir de forma equilibrada entre os médicos

-- Criar uma CTE para numerar os pacientes sem médico
WITH PacientesSemMedico AS (
    SELECT 
        Id,
        Nome,
        ROW_NUMBER() OVER (ORDER BY DataCriacao) as RowNum
    FROM Pacientes 
    WHERE MedicoId IS NULL
),
MedicosDisponiveis AS (
    SELECT 
        Id,
        Nome,
        ROW_NUMBER() OVER (ORDER BY DataCriacao) as RowNum
    FROM Medicos
)
UPDATE Pacientes 
SET MedicoId = (
    SELECT m.Id 
    FROM MedicosDisponiveis m
    WHERE m.RowNum = ((
        SELECT p.RowNum 
        FROM PacientesSemMedico p 
        WHERE p.Id = Pacientes.Id
    ) - 1) % (SELECT COUNT(*) FROM Medicos) + 1
)
WHERE MedicoId IS NULL;

-- 5. Verificar o resultado da associação
SELECT 'RESULTADO APÓS ASSOCIAÇÃO:' as Status;

SELECT 
    'Pacientes sem médico: ' || COUNT(*) as Info
FROM Pacientes 
WHERE MedicoId IS NULL;

-- 6. Mostrar distribuição de pacientes por médico
SELECT 
    m.Nome as Medico,
    m.CRM,
    m.Especialidade,
    COUNT(p.Id) as TotalPacientes
FROM Medicos m
LEFT JOIN Pacientes p ON m.Id = p.MedicoId
GROUP BY m.Id, m.Nome, m.CRM, m.Especialidade
ORDER BY TotalPacientes DESC, m.Nome;

-- 7. Verificar alguns exemplos de associações criadas
SELECT 
    p.Nome as Paciente,
    p.Documento as DocumentoPaciente,
    m.Nome as Medico,
    m.CRM,
    m.Especialidade
FROM Pacientes p
INNER JOIN Medicos m ON p.MedicoId = m.Id
ORDER BY m.Nome, p.Nome
LIMIT 10;