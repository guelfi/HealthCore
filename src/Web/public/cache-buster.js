// Cache buster script - força limpeza do cache
(function() {
    // Adiciona timestamp único a todos os recursos
    const timestamp = Date.now();
    
    // Força reload se detectar cache antigo
    const cacheKey = 'app-version';
    const currentVersion = '20250911-v3-final';
    const storedVersion = localStorage.getItem(cacheKey);
    
    if (storedVersion !== currentVersion) {
        localStorage.setItem(cacheKey, currentVersion);
        // Limpa todos os caches possíveis
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        // Força reload completo
        window.location.reload(true);
    }
})();