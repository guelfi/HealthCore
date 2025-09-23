🔍 **Debug Script - Execute no Console do Navegador**

Para identificar o problema de conectividade, abra o DevTools (F12) e execute os comandos abaixo no console:

```javascript
// 1. Verificar configuração atual da API
console.log('🔧 Configuração da API:');
console.log('Base URL:', window.location.origin);
console.log('Environment:', import.meta?.env?.MODE || 'unknown');

// 2. Testar endpoint básico com fetch
console.log('🧪 Testando /api/health com fetch...');
fetch('/api/health')
  .then(response => {
    console.log('✅ Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Data:', data);
  })
  .catch(error => {
    console.error('❌ Erro fetch:', error);
  });

// 3. Testar com axios (se disponível)
console.log('🧪 Testando com axios...');
if (typeof axios !== 'undefined') {
  axios.get('/api/health')
    .then(response => {
      console.log('✅ Axios success:', response.data);
    })
    .catch(error => {
      console.error('❌ Axios error:', error);
    });
} else {
  console.log('ℹ️ Axios não disponível no window, testando via import...');
}

// 4. Verificar localStorage (auth store)
console.log('🔑 Verificando auth store:');
const authStore = localStorage.getItem('auth-store');
if (authStore) {
  const parsed = JSON.parse(authStore);
  console.log('Auth state:', {
    isAuthenticated: !!parsed.state?.token,
    hasToken: !!parsed.state?.token,
    hasRefreshToken: !!parsed.state?.refreshToken,
    user: parsed.state?.user?.username
  });
} else {
  console.log('❌ Nenhum auth store encontrado');
}

// 5. Testar autenticação
console.log('🔐 Testando autenticação...');
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'guelfi',
    password: '@246!588'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Login successful:', {
    hasToken: !!data.token,
    hasRefreshToken: !!data.refreshToken,
    user: data.user?.username
  });
  
  // Testar endpoint protegido com token
  return fetch('/api/pacientes', {
    headers: {
      'Authorization': `Bearer ${data.token}`
    }
  });
})
.then(response => {
  console.log('✅ Pacientes endpoint status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Pacientes data:', data);
})
.catch(error => {
  console.error('❌ Erro no teste completo:', error);
});
```

**Instruções:**
1. Abra http://localhost:5005
2. Pressione F12 
3. Vá na aba Console
4. Cole e execute o script acima
5. Observe os resultados para identificar onde está falhando

**Se tudo funcionar no console mas não na aplicação, o problema está no código React/TypeScript.**