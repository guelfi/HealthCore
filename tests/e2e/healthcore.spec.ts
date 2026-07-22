import { expect, test } from '@playwright/test';

test('frontend health and security headers are available', async ({ request }) => {
  const response = await request.get('/health');

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('healthy');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN');
});

test('frontend application shell is served', async ({ page }) => {
  const response = await page.goto('/healthcore/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('#root')).toBeVisible();
});

test('versioned API requests reject anonymous access through the proxy', async ({ request }) => {
  const response = await request.get('/api/v1/pacientes');

  expect(response.status()).toBe(401);
});

test('legacy API requests remain compatible during migration', async ({ request }) => {
  const response = await request.get('/api/pacientes');

  expect(response.status()).toBe(401);
});


test('authenticated refresh flow uses a cookie and logout revokes the session', async ({ request }) => {
  const login = await request.post('/api/v1/auth/login', {
    data: { username: 'e2e-admin', password: 'ci-only-e2e-password-012345678901' },
  });
  expect(login.status()).toBe(200);
  const loginBody = await login.json();
  expect(loginBody.refreshToken).toBeUndefined();
  expect(typeof loginBody.token).toBe('string');

  const refresh = await request.post('/api/v1/auth/refresh');
  expect(refresh.status()).toBe(200);
  const refreshBody = await refresh.json();
  expect(refreshBody.refreshToken).toBeUndefined();

  const logout = await request.post('/api/v1/auth/logout', {
    headers: { Authorization: 'Bearer ' + loginBody.token },
  });
  expect(logout.status()).toBe(200);

  const refreshAfterLogout = await request.post('/api/v1/auth/refresh');
  expect(refreshAfterLogout.status()).toBe(401);
});
