-- Script SQLite para migrar usuários médicos
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
        WHEN u.Username = 'doutor1' THEN 'doutor1@mobilemed.com'
        WHEN u.Username = 'doutor2' THEN 'doutor2@mobilemed.com'
        WHEN u.Username = 'oscar' THEN 'oscar@mobilemed.com'
        WHEN u.Username = 'antonio' THEN 'antonio@mobilemed.com'
        WHEN u.Username = 'marta' THEN 'marta@mobilemed.com'
        ELSE u.Username || '@mobilemed.com'
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
    END as Especialidade,
    datetime('now') as DataCriacao
FROM Users u
WHERE u.Role = 2 -- UserRole.Medico = 2
  AND NOT EXISTS (
      SELECT 1 FROM Medicos m WHERE m.UserId = u.Id
  );