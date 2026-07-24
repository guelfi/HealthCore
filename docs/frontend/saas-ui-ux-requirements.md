# HealthCore - Requisitos de UI/UX SaaS

Data de abertura: 2026-07-23
Status: Levantamento consolidado; implementacao local aprovada em 2026-07-23

Este documento registra as melhorias de UI/UX e produto solicitadas para o HealthCore. O levantamento esta consolidado e serve como referencia para implementacao, validacao local e evolucoes futuras.

## Diretrizes Gerais

- O HealthCore deve ser tratado como um aplicativo SaaS para mÃƒÂ©dicos.
- A experiÃƒÂªncia deve ser mobile first, com layout, navegaÃƒÂ§ÃƒÂ£o, formulÃƒÂ¡rios e chamadas para aÃƒÂ§ÃƒÂ£o pensados inicialmente para celular.
- A interface deve transmitir mais profissionalismo, confianÃƒÂ§a e clareza do que a versÃƒÂ£o atual.
- O produto deve permitir que mÃƒÂ©dicos cadastrem e controlem pacientes e exames realizados.
- Em uma evoluÃƒÂ§ÃƒÂ£o futura, o sistema deverÃƒÂ¡ permitir upload de imagens de exames para anÃƒÂ¡lise com base em LLMs/modelos de mercado.

## Landing Page SaaS

Criar uma landing page pÃƒÂºblica para o HealthCore.

Objetivos principais:

- Apresentar o HealthCore como SaaS mÃƒÂ©dico.
- Explicar o valor do sistema para controle de pacientes e exames.
- Permitir que mÃƒÂ©dicos novos iniciem o cadastro.
- Oferecer acesso claro para mÃƒÂ©dicos jÃƒÂ¡ cadastrados atravÃƒÂ©s de botÃƒÂ£o de login.
- Manter a experiÃƒÂªncia adequada para mobile first.

Elementos esperados:

- Identidade visual mais profissional para o SaaS.
- Chamada principal direcionada a mÃƒÂ©dicos.
- BotÃƒÂ£o para cadastro de novo mÃƒÂ©dico.
- BotÃƒÂ£o para login de mÃƒÂ©dicos jÃƒÂ¡ cadastrados.
- ApresentaÃƒÂ§ÃƒÂ£o simples do plano de assinatura.
- ComunicaÃƒÂ§ÃƒÂ£o de pagamento via PIX.

## Cadastro de MÃƒÂ©dico

A landing page deve conduzir o mÃƒÂ©dico ao cadastro.

O cadastro deverÃƒÂ¡ estar conectado ao modelo comercial do SaaS:

- O plano de assinatura ÃƒÂ© ÃƒÂºnico.
- O valor mensal ÃƒÂ© fixo.
- O mÃƒÂ©dico poderÃƒÂ¡ escolher entre pagamento mensal ou plano anual.
- O plano anual deve conceder desconto equivalente a dois meses.
- No plano anual, o pagamento serÃƒÂ¡ feito em uma ÃƒÂºnica cobranÃƒÂ§a PIX.
- No plano mensal, a cobranÃƒÂ§a serÃƒÂ¡ feita mÃƒÂªs a mÃƒÂªs via PIX.

## Pagamentos e Assinatura

Regras de negÃƒÂ³cio registradas para planejamento posterior:

- O pagamento serÃƒÂ¡ obrigatoriamente via PIX.
- Para assinatura anual, o sistema deve gerar uma ÃƒÂºnica cobranÃƒÂ§a.
- Para assinatura mensal, o sistema deve gerar cobranÃƒÂ§a mensal.
- A data de vencimento serÃƒÂ¡ sempre o primeiro dia do mÃƒÂªs corrente.
- O sistema deverÃƒÂ¡ controlar pagamentos em aberto.
- MÃƒÂ©dicos inadimplentes devem ser inativados apÃƒÂ³s 5 dias sem pagamento apÃƒÂ³s a data de vencimento.
- A inativaÃƒÂ§ÃƒÂ£o deve impedir o uso normal da aplicaÃƒÂ§ÃƒÂ£o pelo mÃƒÂ©dico inadimplente.

## Lembretes de Pagamento

O sistema deverÃƒÂ¡ enviar lembretes de pagamento por:

- E-mail.
- WhatsApp via Evolution API.

Os lembretes deverÃƒÂ£o apoiar o fluxo de cobranÃƒÂ§a mensal e reduzir inadimplÃƒÂªncia.

Detalhes de frequÃƒÂªncia, conteÃƒÂºdo das mensagens e gatilhos ainda serÃƒÂ£o definidos no planejamento.

## DecisÃµes Comerciais e de CobranÃ§a

- Valor mensal do plano: R$49,00.
- Plano anual: pagamento Ãºnico com desconto equivalente a dois meses.
- PerÃ­odo de teste: 30 dias.
- Provedor de PIX: nÃ£o implementar nesta versÃ£o; manter planejado para evoluÃ§Ã£o futura.
- Evolution API: nÃ£o implementar envio real nesta versÃ£o; manter planejado para evoluÃ§Ã£o futura.
- Provedor de e-mail: nÃ£o implementar envio real nesta versÃ£o; manter planejado para evoluÃ§Ã£o futura.
- Templates de cobranÃ§a: criar template bÃ¡sico e tela de configuraÃ§Ã£o.
- A tela de configuraÃ§Ã£o de templates deve possuir aba para e-mail e aba para WhatsApp/Evolution API.
- ReativaÃ§Ã£o apÃ³s atraso: apÃ³s recebimento de comprovante de pagamento por e-mail ou WhatsApp, o administrador deve liberar manualmente o mÃ©dico.

## Tela de Login

A tela de login atual estÃƒÂ¡ visualmente simples, com fundo branco predominante.

Melhorias solicitadas:

- Adicionar imagem de fundo para transmitir aparÃƒÂªncia mais profissional.
- Manter o formulÃƒÂ¡rio de login claro, legÃƒÂ­vel e fÃƒÂ¡cil de usar.
- Preservar boa experiÃƒÂªncia em desktop e mobile.
- Garantir que o fundo nÃƒÂ£o prejudique contraste, leitura ou acessibilidade.
- Manter acesso para mÃƒÂ©dicos jÃƒÂ¡ cadastrados.

## Dashboard Administrativo

A visÃ£o atual do dashboard administrativo apresenta cards iniciais com cores fortes, incluindo tons de rosa/vermelho que devem ser suavizados.

Melhorias solicitadas:

- Usar cores mais pastÃ©is nos botÃµes/cards iniciais do dashboard.
- Evitar tons muito fortes, principalmente rosa/vermelho saturados.
- Manter consistÃªncia visual entre os cards superiores e os blocos de informaÃ§Ã£o relacionados abaixo.
- A cor usada em um card de mÃ©trica superior deve ser reutilizada no card/bloco inferior correspondente.
- Exemplo: se o card "MÃ©dicos" usar verde pastel, o bloco inferior com totais/evoluÃ§Ã£o de mÃ©dicos deve usar a mesma famÃ­lia de cor.
- Exemplo: se o card "Pacientes" usar rosa pastel, o bloco inferior de pacientes e exames deve usar a mesma famÃ­lia de cor.
- Aplicar o mesmo princÃ­pio para especialidades, exames, crescimento semanal e atividades, quando houver relaÃ§Ã£o visual ou funcional.
- A tela atual estÃ¡ sendo avaliada na visÃ£o de administrador.
- A visÃ£o logada como mÃ©dico exibe conteÃºdos diferentes nos cards e serÃ¡ detalhada em uma prÃ³xima interaÃ§Ã£o.

Comportamento mobile:

- No mobile, evitar exibir os quatro cards principais um abaixo do outro quando isso gerar uma tela longa e pouco eficiente.
- Priorizar cards menores.
- Avaliar layout em duas colunas por duas linhas para os quatro cards principais.
- Se a largura permitir uma visualizaÃ§Ã£o boa e legÃ­vel, avaliar manter os quatro cards lado a lado.
- A decisÃ£o final deve considerar legibilidade, toque confortÃ¡vel, hierarquia visual e ausÃªncia de sobreposiÃ§Ãµes.

## Dashboard MÃ©dico

A visÃ£o logada como mÃ©dico apresenta conteÃºdos diferentes da visÃ£o administrativa e deve ser tratada como uma experiÃªncia prÃ³pria.

Cards atuais observados:

- Meus Pacientes.
- Total de Exames.
- Exames Este MÃªs.
- Total Especialidades.

Melhorias solicitadas:

- Aplicar a mesma orientaÃ§Ã£o visual do dashboard administrativo: cores mais pastÃ©is e menos saturadas.
- Evitar rosa/vermelho forte nos cards, especialmente em mÃ©tricas que nÃ£o representam erro ou alerta.
- Manter consistÃªncia entre a cor do card superior e blocos inferiores relacionados.
- O card "Meus Pacientes" deve dialogar visualmente com blocos/listas de pacientes do mÃ©dico.
- O card "Total de Exames" e "Exames Este MÃªs" devem dialogar visualmente com o bloco inferior de exames.
- O card "Total Especialidades" deve usar cor suave e legÃ­vel, mesmo quando o valor for zero.
- A mensagem de boas-vindas do mÃ©dico deve ser preservada no desktop, mas no mobile pode ser simplificada ou reposicionada para nÃ£o competir com o tÃ­tulo.
- Os cards devem deixar claro que os dados exibidos pertencem ao mÃ©dico logado, nÃ£o ao sistema inteiro.

Comportamento mobile:

- Evitar cards grandes empilhados um abaixo do outro quando isso alongar excessivamente a tela.
- Priorizar cards menores no mobile.
- Avaliar layout em duas colunas por duas linhas para os quatro cards principais.
- Caso o espaÃ§o permita sem prejudicar legibilidade, avaliar uma disposiÃ§Ã£o mais compacta que reduza rolagem inicial.
- Garantir que Ã­cones, textos e nÃºmeros nÃ£o fiquem sobrepostos ou cortados.
- Manter Ã¡rea de toque confortÃ¡vel para navegaÃ§Ã£o e aÃ§Ãµes futuras.

ObservaÃ§Ãµes para planejamento:

- A estrutura visual dos dashboards de administrador e mÃ©dico deve compartilhar tokens/componentes de estilo sempre que possÃ­vel.
- As mÃ©tricas e textos devem ser parametrizados por perfil para evitar duplicaÃ§Ã£o de layout.
- A hierarquia visual deve favorecer leitura rÃ¡pida: tÃ­tulo, resumo principal, blocos detalhados.

## Grids e Listagens

Todas as telas com grid/listagem devem seguir um padrÃ£o Ãºnico de apresentaÃ§Ã£o.

Telas observadas neste requisito:

- GestÃ£o de MÃ©dicos.
- GestÃ£o de Especialidades.
- GestÃ£o de Pacientes.
- GestÃ£o de Exames.
- GestÃ£o de UsuÃ¡rios.

Melhorias solicitadas:

- Todos os grids devem exibir 10 linhas por pÃ¡gina como padrÃ£o.
- Todos os grids devem ter a mesma altura visual de tabela, independentemente da quantidade de registros retornados na pÃ¡gina atual.
- As linhas dos grids devem ter altura uniforme entre todas as telas.
- Evitar que cada grid tenha espaÃ§amento vertical prÃ³prio, como ocorre atualmente entre MÃ©dicos e Especialidades.
- Quando houver menos de 10 registros, a Ã¡rea do grid deve manter altura consistente para preservar alinhamento visual da pÃ¡gina.
- A paginaÃ§Ã£o deve ser padronizada em todas as telas.
- Adotar como padrÃ£o Ãºnico a paginaÃ§Ã£o exibida atualmente no grid de Pacientes.
- Remover ou corrigir paginaÃ§Ãµes inconsistentes, como exibiÃ§Ã£o invÃ¡lida do tipo "NaN-NaN de undefined".
- O total de registros, intervalo exibido, botÃµes de prÃ³xima/anterior e pÃ¡ginas devem seguir a mesma posiÃ§Ã£o, estilo e comportamento em todos os grids.
- A experiÃªncia deve funcionar igualmente para administrador e mÃ©dico, respeitando os dados permitidos para cada perfil.

Comportamento mobile:

- Manter 10 itens por pÃ¡gina como regra funcional, mas adaptar a apresentaÃ§Ã£o para evitar quebra visual.
- Avaliar tabela responsiva com rolagem horizontal controlada ou cards compactos por registro, de acordo com a complexidade de cada grid.
- A paginaÃ§Ã£o mobile deve continuar clara e fÃ¡cil de tocar.
- Garantir que colunas importantes nÃ£o fiquem ilegÃ­veis ou escondidas sem indicaÃ§Ã£o.

ObservaÃ§Ãµes para planejamento:

- Criar ou consolidar um componente Ãºnico de grid/tabela reutilizÃ¡vel.
- Criar ou consolidar um componente Ãºnico de paginaÃ§Ã£o reutilizÃ¡vel.
- Definir tokens de altura de linha, altura mÃ­nima do corpo da tabela e espaÃ§amentos.
- Revisar MÃ©dicos, Especialidades, Pacientes, Exames e UsuÃ¡rios para eliminar variaÃ§Ãµes desnecessÃ¡rias de layout.

## PermissÃµes por Perfil e Perfil do UsuÃ¡rio

As telas e aÃ§Ãµes devem respeitar claramente o perfil do usuÃ¡rio logado.

Perfil MÃ©dico:

- MÃ©dicos sÃ³ podem visualizar os prÃ³prios pacientes.
- MÃ©dicos sÃ³ podem visualizar exames vinculados aos seus prÃ³prios pacientes.
- MÃ©dicos podem consultar especialidades.
- MÃ©dicos nÃ£o podem criar, editar ou excluir especialidades.
- MÃ©dicos nÃ£o podem administrar usuÃ¡rios do sistema.
- A navegaÃ§Ã£o, botÃµes de aÃ§Ã£o e opÃ§Ãµes de CRUD devem refletir essas restriÃ§Ãµes para evitar aÃ§Ãµes indisponÃ­veis ou confusas.

Perfil Administrador:

- Administradores podem visualizar todos os mÃ©dicos cadastrados.
- Administradores podem visualizar pacientes de todos os mÃ©dicos.
- Administradores podem visualizar exames de todos os pacientes/mÃ©dicos.
- Administradores podem realizar CRUD completo de especialidades.
- Administradores podem realizar CRUD completo de usuÃ¡rios.
- Administradores devem conseguir manter mÃ©dicos, usuÃ¡rios, pacientes, exames e especialidades de forma centralizada.

Header e perfil do usuÃ¡rio:

- O header nÃ£o deve exibir apenas a primeira letra do usuÃ¡rio logado.
- O header deve exibir o nome completo do usuÃ¡rio logado, quando disponÃ­vel.
- Em telas menores, avaliar versÃ£o compacta que preserve identificaÃ§Ã£o clara sem quebrar o layout.
- Ao clicar no nome do usuÃ¡rio no header, o sistema deve abrir a ediÃ§Ã£o do prÃ³prio perfil.
- A ediÃ§Ã£o do prÃ³prio perfil deve respeitar permissÃµes e nÃ£o permitir elevaÃ§Ã£o indevida de privilÃ©gio.
- O usuÃ¡rio deve conseguir atualizar seus prÃ³prios dados cadastrais permitidos.

ObservaÃ§Ãµes para planejamento:

- Revisar frontend e backend para garantir que as permissÃµes estejam aplicadas nas duas camadas.
- O frontend deve esconder ou desabilitar aÃ§Ãµes incompatÃ­veis com o perfil.
- O backend deve continuar sendo a fonte final de autorizaÃ§Ã£o, bloqueando qualquer tentativa indevida via API.
- A experiÃªncia mobile deve evitar menus ou botÃµes que o usuÃ¡rio nÃ£o possa utilizar.

## Telas Mobile do Perfil MÃ©dico

As telas mobile do perfil mÃ©dico devem preservar as permissÃµes e evitar aÃ§Ãµes que nÃ£o pertencem ao perfil.

Telas observadas neste requisito:

- GestÃ£o de Especialidades logado como mÃ©dico.
- GestÃ£o de Pacientes logado como mÃ©dico.
- GestÃ£o de Exames logado como mÃ©dico.
- Menu/header mobile com dropdown do usuÃ¡rio.

Ajustes solicitados/observados:

- Na tela de Especialidades, mÃ©dico deve consultar especialidades, mas nÃ£o deve ver botÃ£o "Adicionar Especialidade" nem FAB de criaÃ§Ã£o.
- Na tela de Especialidades, manter apenas aÃ§Ãµes de visualizaÃ§Ã£o permitidas ao mÃ©dico.
- Na tela de Pacientes, mÃ©dico deve visualizar apenas seus prÃ³prios pacientes.
- Na tela de Exames, mÃ©dico deve visualizar apenas exames dos seus prÃ³prios pacientes.
- BotÃµes de adicionar em Pacientes e Exames devem ser avaliados conforme a regra de negÃ³cio do mÃ©dico: se o mÃ©dico puder cadastrar seus prÃ³prios pacientes e exames, manter; se nÃ£o puder, remover.
- O menu lateral/mobile do mÃ©dico nÃ£o deve exibir itens administrativos, como UsuÃ¡rios ou gestÃ£o completa de MÃ©dicos, quando nÃ£o forem permitidos.
- A pÃ¡gina deve deixar claro que os dados exibidos sÃ£o filtrados pelo mÃ©dico logado.
- Quando houver poucos registros, o container do grid/listagem deve manter altura consistente sem parecer vazio ou quebrado.
- O FAB nÃ£o deve sobrepor conteÃºdo Ãºtil, paginaÃ§Ã£o, barra horizontal ou Ãºltima linha da tabela/lista.
- Em mobile, quando o grid virar cards ou tabela compacta, a hierarquia deve priorizar nome do paciente, documento, modalidade e data relevante.
- A paginaÃ§Ã£o mobile deve permanecer no mesmo padrÃ£o visual definido para todos os grids.

Header/dropdown mobile:

- O dropdown atual mostra apenas o username, como "dr.bruno"; deve evoluir para nome completo quando disponÃ­vel.
- O dropdown deve oferecer ediÃ§Ã£o do prÃ³prio perfil alÃ©m da opÃ§Ã£o de sair.
- A Ã¡rea clicÃ¡vel do nome completo deve ser clara e confortÃ¡vel para toque.
- Em mobile, se o nome completo for longo, deve usar truncamento controlado ou segunda linha sem quebrar o header.

ObservaÃ§Ãµes para planejamento:

- Definir uma matriz de permissÃµes por tela e aÃ§Ã£o antes da implementaÃ§Ã£o.
- Aplicar a matriz tanto na renderizaÃ§Ã£o do menu/botÃµes quanto nas chamadas de API.
- Revisar componentes de FAB para que respeitem permissÃµes e nÃ£o sejam exibidos globalmente sem contexto.
- Validar as telas mobile do mÃ©dico e do administrador separadamente.

## FormulÃ¡rios em Modais e Cards de Entrada

Todos os cards/modais de cadastro e ediÃ§Ã£o devem ter campos distribuÃ­dos de forma mais harmÃ´nica, usando o espaÃ§o disponÃ­vel de maneira confortÃ¡vel e visualmente agradÃ¡vel.

Telas observadas neste requisito:

- Adicionar MÃ©dico.
- Editar MÃ©dico.
- Adicionar Especialidade.
- Editar Especialidade.
- Adicionar Paciente.
- Editar Paciente.
- Adicionar Exame.
- Editar Exame.
- Adicionar UsuÃ¡rio.
- Editar UsuÃ¡rio.

Melhorias solicitadas:

- Padronizar a largura dos modais por tipo de formulÃ¡rio, evitando modais estreitos demais para muitos campos.
- Evitar campos muito pequenos, espremidos ou desalinhados, como observado nos formulÃ¡rios de Paciente.
- Evitar excesso de Ã¡rea branca sem uso quando hÃ¡ poucos campos centralizados em uma regiÃ£o pequena do modal.
- Distribuir campos em linhas e colunas de acordo com o tipo de dado e o espaÃ§o necessÃ¡rio.
- Campos longos, como nome completo, e-mail, endereÃ§o, descriÃ§Ã£o e laudo, devem ter largura confortÃ¡vel.
- Campos curtos, como CPF, CRM, status, perfil, data e telefone, podem compartilhar linha quando houver espaÃ§o suficiente.
- Textareas como descriÃ§Ã£o, endereÃ§o e laudo devem ter altura adequada para leitura e ediÃ§Ã£o sem parecer comprimidas.
- Labels, placeholders e mensagens auxiliares devem seguir um padrÃ£o Ãºnico de alinhamento e espaÃ§amento.
- Os botÃµes de aÃ§Ã£o do rodapÃ© devem ficar sempre alinhados, com espaÃ§amento consistente e sem parecer deslocados.
- A Ã¡rea de metadados em ediÃ§Ã£o, como ID, CRM, perfil, criado em e atualizado em, deve ser organizada sem competir com os campos principais.
- As aÃ§Ãµes destrutivas, como Excluir, devem manter destaque visual suficiente, mas sem parecer a aÃ§Ã£o principal do formulÃ¡rio.
- O botÃ£o principal, como Adicionar ou Salvar, deve ter hierarquia clara.
- O botÃ£o Fechar/Cancelar deve ser visualmente secundÃ¡rio e consistente em todos os modais.
- O layout de criar e editar da mesma entidade deve ser coerente, mudando apenas o que for necessÃ¡rio para metadados e aÃ§Ãµes extras.

Comportamento mobile:

- Em mobile, os modais devem ocupar uma largura confortÃ¡vel da tela, com margens seguras.
- Campos devem empilhar quando a largura nÃ£o comportar duas colunas sem perda de legibilidade.
- Evitar inputs cortados, Ã­cones sobrepostos, textos truncados de forma acidental e labels invadindo valores.
- O rodapÃ© de aÃ§Ãµes deve permanecer acessÃ­vel sem cobrir campos importantes.
- Em formulÃ¡rios longos, permitir rolagem interna clara, mantendo cabeÃ§alho e aÃ§Ãµes utilizÃ¡veis quando fizer sentido.
- Tamanho mÃ­nimo de toque deve ser preservado para inputs, selects, toggles e botÃµes.

ObservaÃ§Ãµes para planejamento:

- Criar ou consolidar componentes reutilizÃ¡veis para Modal, FormSection, FormGrid, FieldRow e ActionFooter.
- Definir regras responsivas para grid de formulÃ¡rio: uma coluna no mobile, duas colunas para campos mÃ©dios no desktop e largura total para campos longos.
- Revisar todos os formulÃ¡rios existentes para eliminar estilos especÃ­ficos inconsistentes.
- Validar visualmente criar e editar para cada entidade em desktop e mobile.

## Pontos em Aberto Para Planejamento

- Modelo de confirmaÃƒÂ§ÃƒÂ£o de pagamento.
- Textos comerciais da landing page.
- Campos obrigatÃƒÂ³rios no cadastro pÃƒÂºblico do mÃƒÂ©dico.
- Se o cadastro pÃƒÂºblico cria mÃƒÂ©dico ativo imediatamente ou aguardando pagamento.
- FrequÃƒÂªncia dos lembretes por e-mail e WhatsApp.
- PolÃƒÂ­tica de acesso para mÃƒÂ©dicos inativos.
- Escopo exato da futura anÃƒÂ¡lise de exames por IA.
















## Requisitos incorporados ao codigo local - 2026-07-23

- Cards inferiores do dashboard medico em duas colunas no desktop, alinhados aos quatro cards superiores.
- Total real de especialidades incorporado ao dashboard medico, exibindo a quantidade retornada pela API.

## Atualizacao de Requisitos Incorporados - 2026-07-23

- No dashboard medico desktop, os cards inferiores `Exames` e `Atividades` devem ocupar duas colunas cada, alinhando visualmente com o grid de quatro cards superiores.
- O card `Total Especialidades` do dashboard medico deve exibir o total real de especialidades cadastradas no sistema, pois medicos podem consultar especialidades mesmo sem permissao de CRUD.
- A validacao local atual confirmou `Total Especialidades = 6` para o usuario medico `dr.bruno`.
- A publicacao na OCI continua fora desta etapa ate aprovacao local explicita.

## Atualizacao de Validacao Local Aprovada - 2026-07-23

- Interface desktop/mobile aprovada pelo usuario para a rodada local.
- RBAC aprovado por API local com dmin, dr.bruno e dr.ana; medicos visualizam somente seus proprios pacientes e exames.
- Swagger local aprovado no navegador interno em http://192.168.15.157/healthcore/swagger/index.html.
- O caminho publico esperado deve ser o mesmo no local e na OCI: /healthcore/swagger/index.html, alterando apenas host/IP.
- Logout deve direcionar para a landing page publica.
- Indicadores de rolagem/deslize devem manter contraste suficiente e orientar a direcao de rolagem no mobile e na landing page.
- Senhas dos usuarios de seed/demo devem seguir a senha padrao aprovada para a rodada local, protegida por configuracao opt-in.
