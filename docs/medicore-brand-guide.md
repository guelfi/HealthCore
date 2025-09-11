# MediCore - Guia de Identidade Visual

## 🎨 Conceito da Marca

**MediCore** representa o núcleo essencial da tecnologia médica, combinando:
- **Confiabilidade médica** (cruz médica)
- **Inovação tecnológica** (elementos de circuito)
- **Segurança** (gradientes azul-verde)
- **Profissionalismo** (design limpo e moderno)

## 📁 Arquivos de Logo Criados

### 1. Logo Principal
- **Arquivo**: `medicore-logo.svg`
- **Tamanho**: 40x40px
- **Uso**: Ícone principal, botões, cards

### 2. Favicon
- **Arquivo**: `favicon.svg`
- **Tamanho**: 32x32px
- **Uso**: Aba do navegador, bookmarks

### 3. Logo Header
- **Arquivo**: `medicore-header-logo.svg`
- **Tamanho**: 160x40px
- **Uso**: Cabeçalho da aplicação, navbar

## 🎨 Paleta de Cores

### Cores Primárias
```css
--primary-blue: #2563EB    /* Azul confiança */
--primary-green: #059669   /* Verde saúde */
--primary-dark: #1E40AF    /* Azul escuro */
```

### Cores Secundárias
```css
--accent-blue: #60A5FA     /* Azul claro tech */
--accent-green: #34D399    /* Verde claro tech */
--neutral-dark: #1E293B    /* Texto principal */
--neutral-light: #F8FAFC   /* Fundo claro */
```

## 📐 Especificações Técnicas

### Proporções
- **Ícone quadrado**: 1:1 (40x40, 32x32)
- **Logo horizontal**: 4:1 (160x40)
- **Espaçamento mínimo**: 8px ao redor do logo

### Tipografia Recomendada
- **Fonte**: Inter, Roboto, system-ui
- **Peso**: 600-700 (semibold/bold)
- **Tamanho mínimo**: 12px

## 🔧 Implementação no Projeto

### HTML
```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Header Logo -->
<img src="/medicore-header-logo.svg" alt="MediCore" class="header-logo">

<!-- Ícone Principal -->
<img src="/medicore-logo.svg" alt="MediCore" class="app-icon">
```

### CSS
```css
.header-logo {
  height: 40px;
  width: auto;
}

.app-icon {
  width: 40px;
  height: 40px;
}

/* Responsivo */
@media (max-width: 768px) {
  .header-logo {
    height: 32px;
  }
  .app-icon {
    width: 32px;
    height: 32px;
  }
}
```

## ✅ Diretrizes de Uso

### ✅ Permitido
- Usar em fundos brancos ou claros
- Redimensionar proporcionalmente
- Usar as cores originais
- Aplicar em materiais médicos/tecnológicos

### ❌ Não Permitido
- Alterar as cores do gradiente
- Distorcer as proporções
- Usar em fundos que comprometam a legibilidade
- Remover elementos da cruz médica
- Usar versões pixelizadas

## 🚀 Próximos Passos

1. **Atualizar título da aplicação** de "MobileMed" para "MediCore"
2. **Substituir referências** nos arquivos de configuração
3. **Atualizar documentação** com novo nome
4. **Testar legibilidade** em diferentes dispositivos
5. **Criar versões adicionais** se necessário (monocromática, invertida)

---

**Criado em**: Janeiro 2025  
**Versão**: 1.0  
**Status**: Pronto para implementação