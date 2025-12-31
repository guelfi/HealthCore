-- Script para associar o usuário administrador guelfi a um perfil de médico

-- Primeiro, verificar se já existe um médico associado ao usuário guelfi
SELECT 'Verificando médicos existentes...' as status;
SELECT Id, UserId, Nome, CRM FROM Medicos;

-- Criar um perfil de médico para o usuário administrador guelfi
INSERT OR IGNORE INTO Medicos (
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
VALUES (
    'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB',
    'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', -- UserId do usuário guelfi
    'Dr. Administrador Guelfi',
    '00000000000',
    '1980-01-01',
    '(11) 99999-9999',
    'admin@healthcore.com',
    'Rua Administrador, 000 - São Paulo/SP',
    'CRM/SP 000000',
    'Administração',
    datetime('now')
);

-- Verificar o resultado
SELECT 
    'Médico admin guelfi criado:' as status,
    m.Id,
    m.Nome,
    m.CRM,
    u.Username,
    u.Role
FROM Medicos m
INNER JOIN Users u ON m.UserId = u.Id
WHERE u.Username = 'guelfi';