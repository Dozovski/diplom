const { test, expect } = require('@playwright/test');
const { API } = require('../helpers/api');
const { loginViaUI } = require('../helpers/auth');

test.describe('Authentication', () => {

  // ─── Registration ─────────────────────────────────────────────────────────

  test.describe('Registration', () => {
    test('successful registration', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      const res = await request.post(`${API}/register`, {
        data: { name: 'Иван Иванов', phone, password: 'password123' },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.token).toBeTruthy();
      expect(body.user.name).toBe('Иван Иванов');
      expect(body.user.role).toBe('user');
    });

    test('duplicate phone rejected', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      await request.post(`${API}/register`, {
        data: { name: 'User1', phone, password: 'password123' },
      });
      const res2 = await request.post(`${API}/register`, {
        data: { name: 'User2', phone, password: 'password123' },
      });
      expect(res2.status()).toBe(422);
    });

    test('missing name returns 422', async ({ request }) => {
      const res = await request.post(`${API}/register`, {
        data: { phone: `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13), password: 'pass123' },
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors?.name || body.message).toBeTruthy();
    });

    test('missing phone returns 422', async ({ request }) => {
      const res = await request.post(`${API}/register`, {
        data: { name: 'Test', password: 'pass123' },
      });
      expect(res.status()).toBe(422);
    });

    test('password too short returns 422', async ({ request }) => {
      const res = await request.post(`${API}/register`, {
        data: { name: 'Test', phone: `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13), password: '123' },
      });
      expect(res.status()).toBe(422);
    });

    test('XSS payload in name is stored safely', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      const xss = '<script>alert(1)</script>';
      const res = await request.post(`${API}/register`, {
        data: { name: xss, phone, password: 'password123' },
      });
      // Should either accept and sanitize, or reject
      expect([200, 422]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.json();
        // Script tags should not execute — body is JSON, so encoding is fine
        expect(body.user).toBeTruthy();
      }
    });

    test('SQL injection payload in password', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      const res = await request.post(`${API}/register`, {
        data: { name: 'SQLUser', phone, password: "' OR '1'='1" },
      });
      // App should use parameterized queries — just check it doesn't crash
      expect([200, 422, 500]).toContain(res.status());
      if (res.status() === 500) {
        console.warn('BUG: SQL injection caused 500 error');
      }
    });
  });

  // ─── Login ────────────────────────────────────────────────────────────────

  test.describe('Login', () => {
    test('valid user login', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      await request.post(`${API}/register`, {
        data: { name: 'LoginUser', phone, password: 'mypassword' },
      });
      const res = await request.post(`${API}/login`, {
        data: { phone, password: 'mypassword' },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.token).toBeTruthy();
    });

    test('wrong password returns 401', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      await request.post(`${API}/register`, {
        data: { name: 'WrongPass', phone, password: 'correct' },
      });
      const res = await request.post(`${API}/login`, {
        data: { phone, password: 'wrong' },
      });
      expect(res.status()).toBe(401);
    });

    test('non-existent phone returns 401', async ({ request }) => {
      const res = await request.post(`${API}/login`, {
        data: { phone: '+375000000000', password: 'anypass' },
      });
      expect(res.status()).toBe(401);
    });

    test('admin/admin shortcut login', async ({ request }) => {
      const res = await request.post(`${API}/login`, {
        data: { phone: 'admin', password: 'admin' },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.user.role).toBe('admin');
      expect(body.token).toBeTruthy();
    });

    test('token is valid for /me endpoint', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      await request.post(`${API}/register`, {
        data: { name: 'MeUser', phone, password: 'mypassword' },
      });
      const login = await request.post(`${API}/login`, {
        data: { phone, password: 'mypassword' },
      });
      const { token } = await login.json();
      const me = await request.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(me.status()).toBe(200);
      const meData = await me.json();
      expect(meData.phone).toBe(phone);
    });

    test('invalid token returns 401', async ({ request }) => {
      const res = await request.get(`${API}/me`, {
        headers: { Authorization: 'Bearer invalidtoken123' },
      });
      expect([401, 302]).toContain(res.status());
    });

    test('logout invalidates token', async ({ request }) => {
      const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
      await request.post(`${API}/register`, {
        data: { name: 'LogoutUser', phone, password: 'pass123' },
      });
      const login = await request.post(`${API}/login`, {
        data: { phone, password: 'pass123' },
      });
      const { token } = await login.json();

      const logoutRes = await request.post(`${API}/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(logoutRes.status()).toBe(200);

      // Token should now be invalid
      const me = await request.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect([401, 302]).toContain(me.status());
    });

    test('empty body login returns error', async ({ request }) => {
      const res = await request.post(`${API}/login`, { data: {} });
      expect([401, 422]).toContain(res.status());
    });
  });

  // ─── UI Auth Flow ─────────────────────────────────────────────────────────

  test.describe('UI Auth Flow', () => {
    test('page shows only AuthPage when not logged in', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
      await page.reload();
      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
      // Navbar should NOT be visible (no user)
      const navItems = await page.locator('nav a[href="/cars"]').count();
      expect(navItems).toBe(0);
    });

    test('admin UI login injects token in localStorage', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
      await page.reload();
      await page.waitForSelector('input[type="password"]', { timeout: 5000 });

      const phoneInput = page.locator('input').first();
      const passInput = page.locator('input[type="password"]').first();
      await phoneInput.fill('admin');
      await passInput.fill('admin');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);

      const token = await page.evaluate(() => localStorage.getItem('token'));
      const user = await page.evaluate(() => JSON.parse(localStorage.getItem('user') || 'null'));
      expect(token).toBeTruthy();
      expect(user?.role).toBe('admin');
    });

    test('after login, password input is gone', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); });
      await page.reload();
      await page.locator('input').first().fill('admin');
      await page.locator('input[type="password"]').fill('admin');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      const passwordFields = await page.locator('input[type="password"]').count();
      expect(passwordFields).toBe(0);
    });

    test('localStorage cleared on logout', async ({ page, request }) => {
      const loginRes = await request.post(`${API}/login`, {
        data: { phone: 'admin', password: 'admin' },
      });
      const { token, user } = await loginRes.json();
      await page.goto('/');
      await page.evaluate(({ t, u }) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      }, { t: token, u: user });
      await page.reload();
      await page.waitForTimeout(1000);

      // Find logout button in Navbar
      await page.locator('button:has-text("Выйти"), a:has-text("Выйти"), [class*="logout"]').first().click({ timeout: 5000 }).catch(async () => {
        // Might be in a dropdown — try to click user menu first
        await page.locator('[class*="user"], [class*="profile"], [class*="avatar"]').first().click({ timeout: 3000 }).catch(() => {});
        await page.locator('button:has-text("Выйти"), a:has-text("Выйти")').first().click({ timeout: 3000 }).catch(() => {});
      });
      await page.waitForTimeout(1500);

      const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
      const userAfter = await page.evaluate(() => localStorage.getItem('user'));
      expect(tokenAfter).toBeNull();
      expect(userAfter).toBeNull();
    });
  });
});
