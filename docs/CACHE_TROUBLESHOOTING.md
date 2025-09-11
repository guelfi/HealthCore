# 🔄 Guia de Resolução de Problemas de Cache

## Problema: Site não atualiza após deploy

Quando você faz um deploy via CI/CD mas o navegador ainda mostra a versão anterior do site, isso geralmente é causado por cache do navegador.

## ✅ Soluções Implementadas

### 1. Configurações do Servidor (nginx)
- Headers de no-cache para arquivos HTML
- Cache busting para assets estáticos
- Headers de segurança adicionais

### 2. Configurações do Build (Vite)
- Hash automático nos nomes dos arquivos
- Source maps para debugging
- Otimização de chunks

### 3. Meta Tags HTML
- Cache-Control no-cache
- Pragma no-cache
- Expires 0

### 4. Script Automático de Limpeza
- Execução automática após cada deploy
- Timestamp injection no HTML
- Restart do nginx

## 🛠️ Soluções para Usuários Finais

### Método 1: Hard Refresh (Mais Comum)
- **Windows/Linux**: `Ctrl + F5` ou `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Mobile**: Feche e abra o app/navegador

### Método 2: Navegação Privada
- Abra uma aba anônima/privada
- Acesse o site normalmente
- O cache privado não interfere

### Método 3: Limpeza Manual do Cache
- **Chrome**: Settings > Privacy > Clear browsing data
- **Firefox**: Settings > Privacy > Clear Data
- **Safari**: Develop > Empty Caches
- **Edge**: Settings > Privacy > Clear browsing data

### Método 4: Parâmetros de URL
- Adicione `?v=` + timestamp na URL
- Exemplo: `http://site.com?v=1234567890`
- Force o navegador a tratar como nova página

## 🔍 Verificação de Atualização

### Para Desenvolvedores
```bash
# Verificar se o deploy foi bem-sucedido
curl -I http://129.153.86.168:5005/

# Verificar headers de cache
curl -I http://129.153.86.168:5005/index.html

# Verificar API
curl http://129.153.86.168:5000/health
```

### Para Usuários
1. Abra as ferramentas de desenvolvedor (F12)
2. Vá na aba Network
3. Marque "Disable cache"
4. Recarregue a página
5. Verifique se os arquivos têm hash diferentes

## 🚀 Prevenção Futura

### Estratégias Implementadas
1. **Versionamento automático**: Arquivos têm hash único
2. **Headers apropriados**: HTML não é cacheado
3. **Build otimizado**: Assets são invalidados automaticamente
4. **Script de deploy**: Limpeza automática após cada deploy

### Monitoramento
- Verifique logs do nginx: `/var/log/nginx/`
- Monitore containers: `docker-compose logs`
- Teste em diferentes navegadores

## 📞 Suporte

Se o problema persistir após tentar todas as soluções:
1. Verifique se o deploy foi concluído com sucesso
2. Teste em navegador diferente
3. Teste em dispositivo diferente
4. Verifique se não há proxy/CDN intermediário
5. Contate a equipe de desenvolvimento

---

**Última atualização**: $(date)
**Versão do documento**: 1.0