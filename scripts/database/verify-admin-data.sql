-- Verificar se o usuário guelfi tem role de administrador no banco de dados
SELECT 'Usuário guelfi:' as info, Username, Role, IsActive FROM Users WHERE Username = 'guelfi';

-- Verificar total de usuários
SELECT 'Total de usuários:' as info, COUNT(*) as total FROM Users;

-- Verificar total de médicos
SELECT 'Total de médicos:' as info, COUNT(*) as total FROM Medicos;

-- Verificar total de especialidades
SELECT 'Total de especialidades:' as info, COUNT(*) as total FROM Especialidades;

-- Verificar total de pacientes
SELECT 'Total de pacientes:' as info, COUNT(*) as total FROM Pacientes;

-- Verificar total de exames
SELECT 'Total de exames:' as info, COUNT(*) as total FROM Exames;