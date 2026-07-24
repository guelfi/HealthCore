# HealthCore - Plano de Implementacao UI/UX SaaS

Data: 2026-07-23
Status: Fases 0 a 9 aprovadas; implementacao concluida em codigo; validacao local aprovada incluindo Swagger; publicacao OCI pendente
Fonte de requisitos: docs/frontend/saas-ui-ux-requirements.md
Escopo de validacao: primeiro ambiente local, depois OCI somente apos aprovacao local

## Objetivo

Implementar a nova versao de UI/UX e base SaaS do HealthCore, incluindo landing page publica, melhoria da tela de login, dashboards por perfil, padronizacao de grids, formularios/modais, permissoes por perfil, header com perfil do usuario e base funcional de assinatura. Nesta versao, PIX, Evolution API e provedor de e-mail devem ficar planejados/configuraveis, sem integracao real.

## Decisoes de Produto Para Esta Versao

- Valor mensal do plano: R$49,00.
- Plano anual: pagamento unico com desconto equivalente a dois meses.
- Periodo de teste: 30 dias.
- Provedor de PIX: nao implementar nesta versao; deixar planejado para evolucao futura.
- Evolution API: nao implementar envio real nesta versao; deixar planejado para evolucao futura.
- Provedor de e-mail: nao implementar envio real nesta versao; deixar planejado para evolucao futura.
- Templates de cobranca: implementar template basico e tela de configuracao.
- Tela de templates deve possuir aba para e-mail e aba para mensagem WhatsApp/Evolution API.
- Reativacao apos atraso: apos recebimento de comprovante por e-mail ou WhatsApp, o administrador deve liberar manualmente o medico.

## Principios de Execucao

- Mobile first em todas as telas novas ou ajustadas.
- Nao alterar projetos fora da pasta HealthCore.
- Nao comprometer Batuara.net ou outros projetos existentes na OCI.
- Validar tudo localmente antes de qualquer publicacao em producao.
- Publicar na OCI somente via GitHub Actions, apos aprovacao explicita do resultado local.
- Manter backend como fonte final de autorizacao, mesmo quando o frontend esconder botoes/menus.
- Preferir componentes reutilizaveis para evitar duplicidade de layout e comportamento.

## Fase 0 - Preparacao e Auditoria Rapida

Status: Concluida em codigo

Tarefas:

- Conferir branch atual, arquivos pendentes e separar mudancas desta etapa das alteracoes ja existentes.
- Mapear componentes frontend atuais de layout, header, menu, dashboard, grids, paginacao e modais.
- Mapear endpoints backend relevantes para usuarios, medicos, pacientes, exames, especialidades e autenticacao.
- Confirmar como o perfil do usuario logado e disponibilizado no frontend.
- Confirmar regras ja implementadas de autorizacao no backend para medico e administrador.
- Definir roteiro de validacao local para administrador e medico.

Criterios de aceite:

- Mapa tecnico dos arquivos/componentes impactados conhecido antes de editar.
- Nenhuma alteracao fora do escopo HealthCore.
- Risco de impacto em OCI/Batuara.net controlado.

## Fase 1 - Design System Basico e Tokens Visuais

Status: Concluida em codigo

Tarefas:

- Definir tokens de cor pastel para metricas: medicos, pacientes, exames, especialidades, atividades/crescimento e estados.
- Substituir gradientes muito fortes por tons mais suaves e profissionais.
- Padronizar sombra, raio, espacamento, altura de cards, altura de linhas e estados de hover/foco.
- Criar ou consolidar utilitarios/classes para cards de metrica, cards de conteudo, formularios, botoes e badges.
- Garantir contraste adequado e legibilidade em desktop e mobile.

Criterios de aceite:

- Cards deixam de usar rosa/vermelho saturado sem motivo de alerta.
- Cores dos cards superiores combinam com os blocos inferiores relacionados.
- UI nao fica dominada por uma unica cor.

## Fase 2 - Landing Page SaaS e Login

Status: Concluida em codigo

Tarefas:

- Criar landing page publica em `/healthcore/` ou rota publica equivalente, mantendo acesso claro ao login.
- Apresentar HealthCore como SaaS para medicos controlarem pacientes e exames.
- Incluir chamada para cadastro de medico.
- Exibir plano unico com opcao mensal e anual com desconto de dois meses.
- Comunicar pagamento via PIX.
- Melhorar tela de login com imagem de fundo profissional, mantendo contraste e usabilidade.
- Ajustar roteamento para usuario autenticado e nao autenticado.

Criterios de aceite:

- Visitante nao autenticado encontra landing page e botao de login.
- Medico ja cadastrado acessa login sem friccao.
- Login fica visualmente mais profissional em desktop e mobile.

Dependencias/decisoes:

- Valor mensal do plano.
- Texto comercial final da landing page.
- Se havera periodo de teste.

## Fase 3 - Cadastro Publico, Assinatura e Cobranca

Status: Concluida em codigo, sem integracoes externas reais conforme decisao de escopo

Tarefas:

- Modelar fluxo de cadastro publico de medico.
- Criar entidades/campos necessarios para assinatura, plano, status de pagamento, vencimento, periodo de teste e inadimplencia.
- Definir status de assinatura: em teste, ativa, pendente, vencida, inativa/cancelada e em carencia.
- Aplicar valor mensal definido de R$49,00.
- Aplicar periodo de teste definido de 30 dias.
- Implementar regra de vencimento no primeiro dia do mes.
- Implementar regra de inativacao apos 5 dias de atraso.
- Registrar no modelo de assinatura que o pagamento sera por PIX, sem implementar provedor real nesta versao.
- Manter PIX planejado/configuravel para evolucao futura.
- Manter Evolution API planejada/configuravel para evolucao futura, sem envio real nesta versao.
- Manter provedor de e-mail planejado/configuravel para evolucao futura, sem envio real nesta versao.
- Criar template basico de cobranca/atraso.
- Criar tela de configuracao de templates com aba de e-mail e aba de WhatsApp/Evolution API.
- Criar estrutura para rotina futura de cobranca e notificacao, sem disparo externo real nesta versao.
- Garantir que medico inadimplente nao use a aplicacao normalmente.
- Permitir reativacao manual pelo administrador apos recebimento de comprovante por e-mail ou WhatsApp.

Criterios de aceite:

- Novo medico pode iniciar cadastro e escolher mensal/anual.
- Sistema registra assinatura, periodo de teste, status de pagamento e status de inadimplencia.
- Regras de vencimento, inativacao e reativacao manual ficam testaveis.
- Integracoes externas ficam planejadas/configuraveis, sem credenciais hardcoded e sem envio real nesta versao.
- Template basico de cobranca pode ser configurado pela interface.
- Administrador consegue liberar manualmente medico apos comprovante de pagamento.

Dependencias/decisoes:

- Provedor/forma final de geracao PIX fica fora desta versao.
- Credenciais e URL da Evolution API ficam fora desta versao.
- Provedor de e-mail fica fora desta versao.
- Templates de mensagem: implementar template basico e tela configuravel.
- Regra de reativacao: manual pelo administrador apos comprovante recebido por e-mail ou WhatsApp.

Observacao:

- Nesta versao nao havera integracao real com PIX, Evolution API ou provedor de e-mail. Implementar somente modelo/configuracao/template e pontos de extensao para plugar os provedores depois.
## Fase 4 - Permissoes por Perfil, Menu e Header

Status: Concluida em codigo

Tarefas:

- Definir matriz de permissoes por perfil e por acao.
- Ajustar menu desktop/mobile para medico nao ver areas administrativas indevidas.
- Remover de medicos botoes/FABs de CRUD de especialidades.
- Garantir que medicos vejam apenas seus pacientes e exames de seus pacientes.
- Garantir que administradores vejam todos os medicos, pacientes, exames, especialidades e usuarios.
- Ajustar header para exibir nome completo do usuario quando disponivel.
- Criar entrada de menu/dropdown para editar o proprio perfil.
- Implementar edicao do proprio perfil sem permitir elevacao de privilegio.
- Validar backend para bloquear tentativas indevidas mesmo via API direta.

Criterios de aceite:

- Medico nao consegue criar/editar/excluir especialidades.
- Medico nao acessa administracao de usuarios.
- Administrador mantem CRUD completo onde permitido.
- Header mostra nome completo ou fallback adequado.
- Usuario consegue abrir edicao do proprio perfil.

## Fase 5 - Dashboards Administrativo e Medico

Status: Concluida em codigo

Tarefas:

- Padronizar componente de card de metrica.
- Aplicar paleta pastel e consistencia entre card superior e bloco inferior relacionado.
- Ajustar dashboard administrativo: medicos, especialidades, pacientes, exames, crescimento semanal e atividades.
- Ajustar dashboard medico: meus pacientes, total de exames, exames do mes, especialidades disponiveis.
- Parametrizar dados e textos por perfil, evitando duplicacao de layout.
- Melhorar comportamento mobile dos cards, avaliando duas colunas por duas linhas.
- Ajustar mensagem de boas-vindas no mobile.

Criterios de aceite:

- Dashboard admin e medico ficam visualmente coerentes.
- Cards mobile nao ficam excessivamente grandes/empilhados sem necessidade.
- Dados do medico deixam claro que sao do medico logado.

## Fase 6 - Grids, Listagens e Paginacao

Status: Concluida em codigo

Tarefas:

- Criar/consolidar componente unico de tabela/grid.
- Criar/consolidar componente unico de paginacao baseado no padrao atual de Pacientes.
- Aplicar 10 linhas por pagina como padrao em todos os grids.
- Definir altura uniforme de linha e altura visual consistente para todas as tabelas.
- Corrigir paginações invalidas, como `NaN-NaN de undefined`.
- Ajustar Medicos, Especialidades, Pacientes, Exames e Usuarios.
- Resolver comportamento com poucos registros, mantendo layout consistente.
- Revisar mobile: tabela responsiva, cards compactos ou rolagem horizontal controlada conforme entidade.

Criterios de aceite:

- Todos os grids usam 10 itens por pagina.
- Todas as linhas possuem altura padronizada.
- Paginacao e totais aparecem de forma identica em todas as telas.
- Mobile nao corta colunas importantes sem indicacao.

## Fase 7 - Formulario, Modal e FAB

Status: Concluida em codigo

Tarefas:

- Criar/consolidar componentes reutilizaveis: Modal, FormSection, FormGrid, FieldRow e ActionFooter.
- Padronizar layouts de criar/editar para Medicos, Especialidades, Pacientes, Exames e Usuarios.
- Ajustar campos longos para largura confortavel.
- Agrupar campos curtos sem espremimento.
- Ajustar textareas de descricao, endereco e laudo.
- Organizar metadados de edicao sem competir com campos principais.
- Padronizar botoes Salvar/Adicionar, Fechar/Cancelar e Excluir.
- Ajustar FAB para nao sobrepor conteudo, paginacao ou ultima linha.
- Exibir FAB somente quando o perfil tiver permissao para criar no contexto atual.

Criterios de aceite:

- Nenhum formulario fica com campos espremidos ou desalinhados.
- Modais usam bem o espaco disponivel.
- Rodape de acoes e consistente.
- FAB respeita permissao e nao atrapalha leitura/toque.

## Fase 8 - Testes e Validacao Local

Status: Concluida localmente; builds Docker API/frontend concluidos; dashboard medico validado; validacao visual desktop/mobile aprovada; RBAC admin/dr.bruno/dr.ana validado por API; Swagger local validado

Tarefas:

- Executar build frontend. Concluido em 2026-07-23 com `docker compose build --no-cache healthcore-frontend`.
- Executar build backend via Docker. Concluido em 2026-07-23 com `docker compose build --no-cache healthcore-api`.
- Executar testes automatizados disponiveis via Docker.
- Validar localmente com usuario administrador.
- Validar localmente com medico. Parcialmente concluido em 2026-07-23: login `dr.bruno`, endpoint de metricas e dashboard medico desktop validados; `totalEspecialidades=6`.
- Validar rotas locais:
  - `http://192.168.15.157/healthcore/`
  - `http://192.168.15.157/healthcore/login`
  - `http://192.168.15.157/healthcore/dashboard`
  - `http://192.168.15.157/healthcore/swagger`
- Validar desktop e mobile por screenshots/inspecao visual.
- Corrigir regressões encontradas.

Criterios de aceite:

- Login admin e medico funcionando.
- Fluxos principais funcionando localmente.
- Sem erros visuais graves em mobile.
- Sem botoes indevidos por perfil.
- Build/testes aprovados ou falhas documentadas com justificativa.

## Fase 9 - Revisao, Aprovacao Local e Preparacao OCI

Status: Aprovada localmente; preparacao para OCI pendente

Tarefas:

- Apresentar resumo das alteracoes implementadas.
- Apresentar evidencias de validacao local.
- Aguardar aprovacao do usuario para producao.
- Conferir workflow GitHub Actions antes de publicar.
- Conferir configuracoes OCI/Nginx apenas dentro do necessario para HealthCore.
- Confirmar que Batuara.net continua sem impacto.

Criterios de aceite:

- Usuario aprova explicitamente o resultado local.
- Plano de rollback esta claro antes da publicacao.
- Nenhuma alteracao manual de producao sem necessidade.

## Fase 10 - Publicacao OCI e Validacao Pos-Deploy

Status: Pendente, bloqueada ate aprovacao local

Tarefas:

- Commitar alteracoes aprovadas.
- Push para GitHub.
- Executar GitHub Actions para deploy OCI.
- Acompanhar workflow.
- Validar producao:
  - `http://129.153.86.168/healthcore/`
  - `http://129.153.86.168/healthcore/login`
  - `http://129.153.86.168/healthcore/dashboard`
  - `http://129.153.86.168/healthcore/swagger`
- Validar login admin e medico em OCI.
- Validar que Batuara.net e demais rotas existentes continuam respondendo.
- Executar rollback se houver falha critica.

Criterios de aceite:

- HealthCore publicado e validado em OCI.
- Batuara.net sem regressao.
- Relatorio final emitido com alteracoes, testes, evidencias e pendencias.

## Ordem Recomendada de Implementacao

1. Preparacao e auditoria rapida.
2. Tokens visuais e componentes base.
3. Permissoes/menu/header/perfil.
4. Grids e paginacao.
5. Modais/formularios/FAB.
6. Dashboards.
7. Landing page e login.
8. Cadastro/assinatura/cobranca manual com templates configuraveis e provedores externos planejados.
9. Validacao local completa.
10. Aprovacao local.
11. Deploy OCI via GitHub Actions.
12. Validacao final e relatorio.

## Estimativa de Complexidade

- UI/UX, grids, modais, dashboards, header e permissoes frontend: alta, mas bem delimitada.
- Backend de permissoes e perfil: media.
- Landing page e login visual: media.
- Assinatura, templates, inadimplencia e reativacao manual: alta, mas sem dependencia externa nesta versao. PIX, e-mail e Evolution API ficam planejados para etapa futura.
- Publicacao OCI: media, condicionada a sucesso local e GitHub Actions.

## Pontos Resolvidos

- Valor mensal do plano: R$49,00.
- Periodo de teste: 30 dias.
- PIX: nao implementar nesta versao; manter planejado.
- Evolution API: nao implementar nesta versao; manter planejada.
- Provedor de e-mail: nao implementar nesta versao; manter planejado.
- Templates de mensagens: criar template basico e tela configuravel com abas para e-mail e WhatsApp/Evolution API.
- Reativacao apos atraso: manual pelo administrador apos comprovante recebido por e-mail ou WhatsApp.

## Pendencias Para Validacao

- Validacao local de interface desktop/mobile aprovada pelo usuario.
- RBAC local aprovado por API para `admin`, `dr.bruno` e `dr.ana`.
- Swagger local aprovado por endpoint e por validacao manual no navegador interno.
- Testes automatizados via Docker permanecem opcionais/pendentes apenas se definidos como gate adicional.
- Publicacao na OCI ainda nao executada e deve ocorrer somente apos autorizacao explicita.

## Gate de Aprovacao

Plano aprovado pelo usuario. Implementacao em codigo concluida e validacao local aprovada. A publicacao em producao permanece bloqueada ate autorizacao explicita para deploy OCI.

A publicacao em producao na OCI deve ocorrer somente apos:

- Implementacao concluida localmente.
- Validacao local aprovada pelo usuario, incluindo interface desktop/mobile, RBAC e Swagger local.
- Confirmacao de que o deploy via GitHub Actions esta pronto.
- Confirmacao de rollback.




## Atualizacao de Status Geral - 2026-07-23

- Status geral ajustado para implementacao concluida em codigo e validacao local parcial concluida.
- Fase 8 atualizada com builds Docker API/frontend concluidos.
- Incluida validacao do dashboard medico com 	otalEspecialidades=6.
- Publicacao OCI permanece pendente ate aprovacao local explicita.

## Atualizacao de Validacao Local - 2026-07-23

- API local recompilada sem cache e container recriado.
- Frontend local recompilado sem cache e container recriado.
- Containers locais HealthCore API/frontend estao healthy.
- Login medico `dr.bruno` validado com HTTP 200.
- Endpoint `/healthcore/api/medico/metrics` validado com `numeroPacientes=2`, `totalExames=2` e `totalEspecialidades=6`.
- Dashboard medico desktop validado por Playwright headless: cards inferiores `Exames` e `Atividades` ocupam duas colunas cada abaixo dos quatro cards superiores.
- Producao OCI permanece bloqueada ate validacao/aprovacao local explicita.
## Atualizacao de Aprovacao Local - 2026-07-23

- Fases 0 a 9 aprovadas pelo usuario.
- Validacao de interface desktop/mobile aprovada pelo usuario.
- RBAC admin/dr.bruno/dr.ana validado por API local.
- Swagger local validado apos rebuild/recreate da API: `http://192.168.15.157/healthcore/swagger/index.html` e `http://192.168.15.157/healthcore/swagger/v1/swagger.json` responderam HTTP 200.

## Atualizacao de Swagger Local - 2026-07-23

- Causa do HTTP 401 identificada: container antigo continha OpenApi.Enabled=false.
- API reconstruida e recriada localmente preservando o volume do banco.
- Swagger local validado via proxy HealthCore com HTTP 200 em /healthcore/swagger/index.html e /healthcore/swagger/v1/swagger.json.
- Publicacao OCI permanece pendente e nao foi executada nesta etapa.

## Atualizacao de Validacao Manual do Swagger - 2026-07-23

- Usuario confirmou carregamento manual no navegador interno de http://192.168.15.157/healthcore/swagger/index.html.
- Caminho publico padronizado para local e OCI: /healthcore/swagger/index.html, alterando apenas o host/IP.
- Ambiente local permanece aprovado; proximo bloco de trabalho e preparar commit/push e deploy OCI quando autorizado.
