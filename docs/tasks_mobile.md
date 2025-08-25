# Plano de Tarefas - Ajustes Mobile First

Este documento descreve as tarefas necessárias para adaptar a interface do frontend MobileMed, garantindo uma experiência de usuário fluida e consistente em dispositivos móveis, seguindo o conceito "Mobile First".

## 1. Layout Principal e Navegação (Header e Sidebar)

O layout principal precisa ser reestruturado para se adaptar a telas menores.

-   [ ] **1.1. Implementar Sidebar Retrátil:**
    -   A `Sidebar` deve ficar oculta por padrão em dispositivos móveis.
    -   Adicionar um ícone de "hamburger menu" no lado esquerdo do `Header`.
    -   Ao clicar no ícone, a `Sidebar` deve surgir como um overlay sobre o conteúdo principal.
    -   Adicionar um fundo escurecido (backdrop) sobre o conteúdo quando a sidebar estiver aberta.
    -   Clicar fora da `Sidebar` ou no backdrop deve fechá-la.

-   [ ] **1.2. Reorganizar o Header:**
    -   Manter o logo/nome "MobileMed" no lado esquerdo do `Header`.
    -   Agrupar as informações do usuário (nome) e o botão de "Sair" dentro de um menu de perfil (Avatar/Dropdown) no lado direito do `Header`. Isso economiza espaço e segue um padrão de design comum.

## 2. Dashboard Responsivo

Os cards e métricas do Dashboard devem ser re-organizados para visualização em uma única coluna em telas pequenas.

-   [ ] **2.1. Adaptar Grid de Cards:**
    -   Modificar o layout do grid do dashboard para que os cards sejam exibidos em uma única coluna (`flex-direction: column` ou `grid-template-columns: 1fr`) em breakpoints móveis.
    -   Garantir que os cards ocupem a largura disponível, com margens adequadas.
    -   Ajustar o tamanho das fontes e dos gráficos dentro dos cards para melhor legibilidade em telas menores.

## 3. Tabelas de Dados (Grids) Responsivas

As tabelas de dados para [Médicos], [Pacientes], [Exames] e [Usuários] são o maior desafio e precisam de uma abordagem mobile-friendly.

-   [ ] **3.1. Transformar Tabelas em Listas de Cards:**
    -   Em dispositivos móveis, em vez de uma tabela horizontal, cada linha de dados será apresentada como um "card" individual em uma lista vertical.
    -   Cada card deve exibir as informações mais importantes (ex: Nome do Paciente, Documento).
    -   As ações (Editar, Excluir) podem ser representadas por ícones dentro de cada card.

-   [ ] **3.2. (Alternativa) Tabela com Scroll Horizontal:**
    *   Como uma alternativa mais simples, garantir que a tabela atual seja rolável horizontalmente em telas pequenas, evitando que o layout principal quebre.
    *   Fixar a primeira coluna (ex: Nome) para manter o contexto enquanto o usuário rola para a direita.
    *   Esta abordagem é menos "mobile-first" mas pode ser um passo intermediário. A abordagem de "Lista de Cards" (3.1) é a preferida.

-   [ ] **3.3. Otimizar Colunas Visíveis:**
    -   Se a abordagem de tabela for mantida, exibir apenas as 2 ou 3 colunas mais essenciais por padrão em telas móveis.
    -   Permitir que o usuário acesse as informações restantes clicando no registro para abrir um modal ou uma view de detalhes.

### 3.4. Ajustes Específicos nos Cards de Dados

-   [ ] **Geral:**
    -   Aumentar o espaçamento interno (padding) e externo (margin) dos cards para melhorar a legibilidade e a área de toque.
-   [ ] **Card de [Médicos]:**
    -   Manter a disposição atual dos campos de informação.
    -   Os elementos de ação/status no final do card (chips) devem ser empilhados verticalmente, com cada chip ocupando uma linha separada para facilitar o toque.
-   [ ] **Card de [Pacientes]:**
    -   Aumentar a altura vertical do card para que todas as informações do paciente sejam exibidas de forma clara, sem cortes ou excesso de quebras de linha.
-   [ ] **Card de [Exames]:**
    -   Ajustar os chips de ação/status para o padrão de um por linha, seguindo o modelo do card de [Médicos].
-   [ ] **Card de [Usuários]:**
    -   Ajustar os chips de ação/status para o padrão de um por linha.

## 4. Revisão Geral e Testes

-   [ ] **4.1. Testar em Dispositivos Reais/Emuladores:**
    -   Validar todas as alterações em diferentes tamanhos de tela (smartphones e tablets).
    -   Verificar a usabilidade e a performance da navegação.
-   [ ] **4.2. Revisar Estilos e Espaçamentos:**
    -   Garantir que todos os componentes tenham espaçamentos consistentes e que não haja sobreposição de elementos.

## 5. Aplicação da Identidade Visual da MobileMed

Para alinhar o projeto com a marca da empresa, as seguintes tarefas de theming devem ser executadas.

-   [ ] **5.1. Configurar Paleta de Cores:**
    -   Definir as cores primárias e secundárias do tema da aplicação usando a paleta oficial:
        -   Azul (Azure Radiance): `#0092ff`
        -   Preto: `#000000`
        -   Branco: `#ffffff`
    -   Aplicar essas cores nos componentes principais (Header, botões, links, etc.) através de variáveis de CSS/SCSS.

-   [ ] **5.2. Aplicar Logo e Favicon:**
    -   Substituir o texto "MobileMed" no Header pelo logo oficial da empresa.
    -   Gerar um `favicon.svg` a partir do logo e adicioná-lo à pasta `public`.
    -   Adicionar a referência ao novo favicon no arquivo `index.html`.

-   [ ] **5.3. Revisão da Tipografia:**
    -   Analisar a fonte utilizada no site da MobileMed e, se possível, aplicá-la ao projeto para maior consistência.