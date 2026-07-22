# Sistema de Debug Mobile - HealthCore

## 📋 Visão Geral

O HealthCore possui um sistema de debug integrado que aparece apenas em ambiente de desenvolvimento, permitindo monitorar informações do dispositivo móvel, responsive breakpoints e performance em tempo real.

## 🎯 Funcionalidades

### 🐛 MobileDebugger
- **FAB roxo** no canto inferior direito (apenas em desenvolvimento)
- **Dialog responsivo** com informações detalhadas do dispositivo
- **Atualização automática** a cada 2 segundos
- **Informações coletadas**:
  - Tipo de dispositivo (Mobile/Tablet/Desktop)
  - Detecção de touch
  - Orientação da tela
  - Breakpoints do Material-UI
  - Informações de rede
  - User Agent completo
  - Viewport e resolução da tela

### ⚙️ Configuração por Ambiente

O sistema utiliza variáveis de ambiente para controlar quando o debugger deve aparecer:

```bash
# .env.development (padrão em DEV)
VITE_ENABLE_DEBUGGER=true
VITE_ENABLE_CONSOLE_LOGS=true
VITE_ENABLE_PERFORMANCE_MONITOR=true

# .env.production (padrão em PROD)
VITE_ENABLE_DEBUGGER=false
VITE_ENABLE_CONSOLE_LOGS=false
VITE_ENABLE_PERFORMANCE_MONITOR=false

# .env.local (sobrescreve todas as outras)
VITE_ENABLE_DEBUGGER=true
```

## 🚀 Como Usar

### 1. **Desenvolvimento Local**
```bash
cd src/Web
npm run dev
```
- O debugger aparece automaticamente (FAB roxo)
- Clique para abrir o painel de informações

### 2. **Teste Mobile com ngrok**
```bash
./scripts/mobile-dev-setup.sh
# Escolha opção 1: "Iniciar desenvolvimento mobile completo"
```
- Acesse a URL ngrok fornecida no celular
- O debugger estará disponível na mesma posição

### 3. **Produção/Deploy**
```bash
npm run build
```
- O debugger **NÃO** aparece em produção
- Logs de console são automaticamente desabilitados

## 🔧 Configuração Avançada

### Forçar Debug em Ambiente Específico
Crie um arquivo `.env.local` para sobrescrever as configurações:

```bash
# Força debug mesmo em build de produção
VITE_ENABLE_DEBUGGER=true

# Para testes locais com API da OCI
VITE_API_BASE_URL=http://129.153.86.168:5000
```

### Debug Programático
```typescript
import { debugManager, logDebug, logInfo } from '../utils/debugManager';

// Verificar se debug está habilitado
if (debugManager.isDebugEnabled) {
  logDebug('Componente carregado', { componentName: 'MyComponent' });
}

// Logs condicionais
logInfo('Informação importante'); // Só aparece em desenvolvimento
logDebug('Debug específico', data); // Só aparece se VITE_ENABLE_CONSOLE_LOGS=true
```

## 📱 Informações Coletadas

### **Dispositivo**
- ✅ Tipo (Mobile/Tablet/Desktop)
- ✅ Detecção de touch (Sim/Não)
- ✅ Orientação (Portrait/Landscape)
- ✅ Breakpoints ativos

### **Tela**
- ✅ Viewport atual
- ✅ Resolução física
- ✅ Pixel ratio
- ✅ Screen size (xs, sm, md, lg, xl)

### **Interação**
- ✅ Plataforma do SO
- ✅ Idioma do navegador
- ✅ Ambiente (development/production)
- ✅ Versão da aplicação

### **Rede**
- ✅ Status online/offline
- ✅ Tipo de conexão (4G, WiFi, etc.)
- ✅ Velocidade estimada
- ✅ Latência (RTT)

## 🎨 Personalização

### Posição do FAB
```typescript
<MobileDebugger 
  position={{ 
    bottom: 100,  // 100px do bottom
    right: 20     // 20px da direita
  }} 
/>

// Ou no canto superior esquerdo
<MobileDebugger 
  position={{ 
    top: 20,
    left: 20
  }} 
/>
```

### Estilo Customizado
O FAB usa a cor `secondary` do theme (roxo por padrão). Para alterar:

```typescript
// No seu theme
const theme = createTheme({
  palette: {
    secondary: {
      main: '#your-color', // Cor do FAB debug
    },
  },
});
```

## 🔒 Segurança

### Proteções Implementadas
1. **Ambiente**: Só aparece em `import.meta.env.DEV === true`
2. **Flag de controle**: Respeitam `VITE_ENABLE_DEBUGGER`
3. **Build production**: Automaticamente removido pelo Vite
4. **Git ignore**: `.env.local` não é commitado

### Arquivo .env.local (ignorado pelo git)
```bash
# Este arquivo NÃO vai para o repositório
# Use para configurações locais de debug
VITE_ENABLE_DEBUGGER=true
VITE_ENABLE_CONSOLE_LOGS=true
```

## 🛠️ Troubleshooting

### Debug não aparece
1. Verifique se está em modo de desenvolvimento: `npm run dev`
2. Confirme a variável: `VITE_ENABLE_DEBUGGER=true`
3. Verifique o console por erros de import

### Informações não atualizam
- O componente atualiza automaticamente a cada 2 segundos
- Feche e abra o dialog para forçar atualização

### Performance impacto
- O debugger tem impacto mínimo em desenvolvimento
- É completamente removido em produção
- Use `VITE_ENABLE_PERFORMANCE_MONITOR=false` se necessário

## 📊 Integração com Ferramentas

### Cypress E2E
```typescript
// Detectar presença do debugger em testes
cy.get('[data-testid="mobile-debugger"]').should('exist');
```

### Analytics/Monitoramento
```typescript
// Enviar informações de dispositivo para analytics
if (debugManager.isDebugEnabled) {
  const deviceInfo = debugManager.getConfig();
  // analytics.track('device_info', deviceInfo);
}
```

---

**🎯 Objetivo**: Facilitar o desenvolvimento e teste da interface mobile, garantindo que a ferramenta só esteja disponível quando necessário e não interfira na experiência de produção.