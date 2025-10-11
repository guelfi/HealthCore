-- Seed: Especialidades Médicas
-- Data: 06/10/2025
-- Descrição: Insere especialidades médicas comuns no sistema

-- Inserir especialidades médicas
INSERT INTO "Especialidades" ("Id", "Nome", "Descricao", "Ativa", "DataCriacao", "DataAtualizacao")
VALUES 
    -- Especialidades Clínicas
    ('11111111-1111-1111-1111-111111111111', 'Cardiologia', 'Especialidade médica que se dedica ao diagnóstico e tratamento das doenças do coração e do sistema circulatório', 1, datetime('now'), NULL),
    ('22222222-2222-2222-2222-222222222222', 'Pediatria', 'Especialidade médica dedicada à assistência à criança e ao adolescente', 1, datetime('now'), NULL),
    ('33333333-3333-3333-3333-333333333333', 'Ortopedia', 'Especialidade médica que cuida do sistema locomotor, ossos, músculos, ligamentos e articulações', 1, datetime('now'), NULL),
    ('44444444-4444-4444-4444-444444444444', 'Dermatologia', 'Especialidade médica que trata das doenças da pele, mucosas, cabelos e unhas', 1, datetime('now'), NULL),
    ('55555555-5555-5555-5555-555555555555', 'Ginecologia e Obstetrícia', 'Especialidade médica que cuida da saúde da mulher em todas as fases da vida', 1, datetime('now'), NULL),
    
    -- Especialidades Cirúrgicas
    ('66666666-6666-6666-6666-666666666666', 'Cirurgia Geral', 'Especialidade médica que realiza procedimentos cirúrgicos em diversas áreas do corpo', 1, datetime('now'), NULL),
    ('77777777-7777-7777-7777-777777777777', 'Neurocirurgia', 'Especialidade médica que trata cirurgicamente as doenças do sistema nervoso', 1, datetime('now'), NULL),
    ('88888888-8888-8888-8888-888888888888', 'Cirurgia Cardiovascular', 'Especialidade médica que realiza cirurgias no coração e vasos sanguíneos', 1, datetime('now'), NULL),
    
    -- Especialidades de Diagnóstico
    ('99999999-9999-9999-9999-999999999999', 'Radiologia', 'Especialidade médica que utiliza métodos de imagem para diagnóstico e tratamento', 1, datetime('now'), NULL),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Patologia', 'Especialidade médica que estuda as doenças através da análise de tecidos e células', 1, datetime('now'), NULL),
    
    -- Outras Especialidades
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Psiquiatria', 'Especialidade médica que trata dos transtornos mentais e comportamentais', 1, datetime('now'), NULL),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Oftalmologia', 'Especialidade médica que cuida da saúde dos olhos e da visão', 1, datetime('now'), NULL),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Otorrinolaringologia', 'Especialidade médica que trata de ouvido, nariz e garganta', 1, datetime('now'), NULL),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Urologia', 'Especialidade médica que trata do sistema urinário e reprodutor masculino', 1, datetime('now'), NULL),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Endocrinologia', 'Especialidade médica que trata das glândulas e hormônios', 1, datetime('now'), NULL),
    ('10101010-1010-1010-1010-101010101010', 'Gastroenterologia', 'Especialidade médica que trata do sistema digestivo', 1, datetime('now'), NULL),
    ('20202020-2020-2020-2020-202020202020', 'Pneumologia', 'Especialidade médica que trata das doenças do sistema respiratório', 1, datetime('now'), NULL),
    ('30303030-3030-3030-3030-303030303030', 'Nefrologia', 'Especialidade médica que trata das doenças dos rins', 1, datetime('now'), NULL),
    ('40404040-4040-4040-4040-404040404040', 'Reumatologia', 'Especialidade médica que trata das doenças do sistema musculoesquelético', 1, datetime('now'), NULL),
    ('50505050-5050-5050-5050-505050505050', 'Oncologia', 'Especialidade médica que trata do câncer', 1, datetime('now'), NULL);

-- Verificação
SELECT COUNT(*) as 'Total de Especialidades Inseridas' FROM "Especialidades";
SELECT 'Seed de Especialidades concluído com sucesso!' as Status;
