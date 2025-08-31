# AutoDebugger - Sistema de Debug Visual em Tempo Real

Componente React reutilizável para debug visual e logging em tempo real durante o desenvolvimento.

## Características

- ✅ **Painel visual** flutuante no canto superior direito
- ✅ **5 níveis de log**: info, success, warning, error, debug
- ✅ **Persistência** automática no localStorage
- ✅ **Download de logs** em arquivo de texto
- ✅ **Salvamento automático** na pasta /logs do projeto
- ✅ **Atalho de teclado**: Ctrl + Alt + D para mostrar/esconder
- ✅ **Toast notifications** para feedback visual
- ✅ **Interface limpa** com controles de save/show/hide/clear
- ✅ **Cores diferenciadas** por tipo de log
- ✅ **Limite automático** de logs para performance
- ✅ **Hook personalizado** para fácil integração
- ✅ **Servidor de logs** local para salvamento direto

## Como Usar

### 1. Hook useAutoDebugger (Recomendado)

```tsx
import { useAutoDebugger } from '../../utils/AutoDebugger';

const MeuComponente: React.FC = () => {
  const debug = useAutoDebugger('MeuComponente');

  React.useEffect(() => {
    debug.info('Componente inicializado');
  }, []);

  const handleClick = () => {
    debug.success('Botão clicado com sucesso!');
  };

  const handleError = (error: any) => {
    debug.error('Erro ao processar:', error);
  };

  return <button onClick={handleClick}>Clique aqui</button>;
};
```

### 2. Componente Wrapper

```tsx
import AutoDebugger from '../../utils/AutoDebugger';

const App: React.FC = () => {
  return (
    <AutoDebugger componentName=\"App\" enabled={true}>
      {/* Seu app aqui */}
      <MinhaAplicacao />
    </AutoDebugger>
  );
};
```

### 3. Instância Direta (Avançado)

```tsx
import { AutoDebuggerLogger } from '../../utils/AutoDebugger';

const debugger = AutoDebuggerLogger.getInstance();
debugger.log('info', 'ComponenteX', 'Mensagem de debug', { dados: 'extra' });
```

## Tipos de Log

```tsx
const debug = useAutoDebugger('MeuComponente');

// Informação geral
debug.info('Usuário logado', { userId: 123 });

// Operação bem-sucedida
debug.success('Dados salvos com sucesso!');

// Alerta/aviso
debug.warning('Cache expirado, recarregando...');

// Erro
debug.error('Falha na requisição:', error);

// Debug técnico
debug.debug('Estado interno:', { state });
```

## Atalhos de Teclado

### 🎹 **Ctrl + Alt + D** - Toggle AutoDebugger

- **Funcionalidade**: Ativa/desativa o AutoDebugger em tempo de execução
- **Feedback visual**: Toast notification colorido na tela
- **Persistência**: Logs continuam sendo capturados mesmo quando oculto
- **Console**: Logs sempre visíveis no console do navegador
- **Comportamento**: Inicia oculto por padrão para não interferir na UI

### Como usar:

1. Abra sua aplicação no navegador
2. Pressione **Ctrl + Alt + D** para mostrar o painel
3. Pressione novamente para ocultar
4. Toast verde = AutoDebugger ativado 🔍
5. Toast laranja = AutoDebugger desativado 🙈

## Controles do Painel

- **💾 Save**: Salvar logs na pasta /logs do projeto
- **👁️ Hide/Show**: Esconder/mostrar o painel
- **🗑️ Clear**: Limpar todos os logs
- **📥 Download Logs**: Baixar logs em arquivo .txt

## Exemplo Prático - PacientesPageTable

```tsx
import { useAutoDebugger } from '../../utils/AutoDebugger';

const PacientesPageTable: React.FC = () => {
  const debug = useAutoDebugger('PacientesPageTable');
  const { pacientes, loading, error, fetchPacientes } = usePacientes();

  React.useEffect(() => {
    debug.info('Componente inicializado');
    debug.debug('Estado inicial:', { pacientes: pacientes.length, loading, error });
  }, []);

  React.useEffect(() => {
    debug.info('Pacientes atualizados:', {
      quantidade: pacientes.length,
      loading,
      error,
      primeiroPaciente: pacientes[0]?.nome || 'nenhum'
    });
  }, [pacientes, loading, error]);

  const handleSave = async () => {
    try {
      debug.info('Iniciando salvamento...');
      await createPaciente(data);
      debug.success('Paciente criado com sucesso!');
    } catch (error) {
      debug.error('Erro ao salvar paciente:', error);
    }
  };

  return (
    // JSX do componente
    // 🎹 Use Ctrl + Alt + D para mostrar/esconder o painel de debug em tempo real!
  );
};
```

### 📝 **Dica de Uso em Tempo Real**:

- Durante desenvolvimento: **Ctrl + Alt + D** para ativar
- Testando fluxos: Veja logs em tempo real sem afetar o código
- Debugging remoto: Compartilhe logs via Save button
- Produção: AutoDebugger oculto, mas pode ser ativado em emergências

## Configuração do Servidor de Logs

Para habilitar o salvamento automático na pasta `/logs` do projeto:

### Windows

```bash
# Navegar para a pasta logs
cd logs

# Executar o servidor (opção 1)
start-log-server.bat

# Ou executar diretamente (opção 2)
node save-log-endpoint.js
```

### Linux/macOS

```bash
# Navegar para a pasta logs
cd logs

# Dar permissão ao script (apenas uma vez)
chmod +x start-log-server.sh

# Executar o servidor
./start-log-server.sh
```

### Como funciona

1. O servidor roda em `http://localhost:3001`
2. AutoDebugger tenta salvar logs automaticamente via servidor
3. Se o servidor não estiver disponível, faz download manual
4. Logs são salvos com nomes no formato: `frontend-debug-YYYY-MM-DD.log`

## Configuração de Produção

Para desabilitar em produção:

```tsx
const isDevelopment = process.env.NODE_ENV === 'development';

<AutoDebugger enabled={isDevelopment}>
  <App />
</AutoDebugger>;
```

## Vantagens do AutoDebugger

1. **Visual**: Vê logs em tempo real na tela
2. **Persistente**: Logs salvos no localStorage
3. **Exportável**: Download de logs para análise
4. **Categorizado**: Diferentes cores e ícones por tipo
5. **Performance**: Limite automático de logs
6. **Limpo**: Interface não intrusiva
7. **Flexível**: Hook personalizado para cada componente

## Quando Usar

- ✅ Debug de fluxo de dados
- ✅ Análise de ciclo de vida de componentes
- ✅ Monitoramento de requisições API
- ✅ Tracking de eventos de usuário
- ✅ Diagnóstico de problemas em produção (temporário)
- ✅ Análise de performance
- ✅ Validação de estados React

---

**Criado por**: Marco Guelfi  
**Data**: 28/08/2025
