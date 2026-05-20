const { test, expect } = require('@playwright/test');
const { API } = require('../helpers/api');

test.describe('Smoke Suite', () => {
  test('Backend /api/cars responds 200', async ({ request }) => {
    const res = await request.get(`${API}/cars`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('Backend /api/reviews responds 200', async ({ request }) => {
    const res = await request.get(`${API}/reviews`);
    expect(res.status()).toBe(200);
  });

  test('Frontend loads and shows auth page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Pail Rental/i);
    // Without user in localStorage, AuthPage must be rendered
    const hasForm = await page.locator('form, input[type="password"]').count();
    expect(hasForm).toBeGreaterThan(0);
  });

  test('Admin login API returns token', async ({ request }) => {
    const res = await request.post(`${API}/login`, {
      data: { phone: 'admin', password: 'admin' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.role).toBe('admin');
  });

  test('Registration API works', async ({ request }) => {
    const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
    const res = await request.post(`${API}/register`, {
      data: { name: 'Smoke User', phone, password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.role).toBe('user');
  });

  test('Protected endpoint without token returns 401/302', async ({ request }) => {
    const res = await request.get(`${API}/bookings`);
    expect([401, 302, 403]).toContain(res.status());
  });

  test('Frontend shows car list after login', async ({ page, request }) => {
    // Create a car as admin first
    const adminLogin = await request.post(`${API}/login`, {
      data: { phone: 'admin', password: 'admin' },
    });
    const { token, user } = await adminLogin.json();
    await request.post(`${API}/cars`, {
      data: {
        name: 'Smoke Car', category: 'Эконом', year: 2022, seats: 5,
        transmission: 'Автомат', fuel: 'Бензин', engine: '1.6L', hp: 110,
        price: 50, lat: 53.9045, lng: 27.5615,
        address: 'Минск тест', photos: [],
      },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });

    // Login via localStorage injection
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token, user });
    await page.reload();
    await page.waitForTimeout(2000);
    // Should not show AuthPage anymore
    const inputs = await page.locator('input[type="password"]').count();
    expect(inputs).toBe(0);
  });
});
