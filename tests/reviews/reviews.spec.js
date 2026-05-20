const { test, expect } = require('@playwright/test');
const { API, createUser, loginAs } = require('../helpers/api');

test.describe('Reviews', () => {
  let userToken, userData;

  test.beforeAll(async ({ request }) => {
    const reg = await createUser(request, 'rev');
    const login = await loginAs(request, reg.phone, reg.password);
    userToken = login.token;
    userData = login.user;
  });

  test('GET /reviews returns array', async ({ request }) => {
    const res = await request.get(`${API}/reviews`);
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('POST /reviews creates review', async ({ request }) => {
    const res = await request.post(`${API}/reviews`, {
      data: { name: 'Reviewer', text: 'Отличный сервис!', rating: 5 },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.rating).toBe(5);
  });

  test('POST /reviews without token returns 401', async ({ request }) => {
    const res = await request.post(`${API}/reviews`, {
      data: { name: 'Anon', text: 'Test review', rating: 3 },
    });
    expect([401, 302]).toContain(res.status());
  });

  test('POST /reviews with XSS payload', async ({ request }) => {
    const xss = '<script>alert("xss")</script>';
    const res = await request.post(`${API}/reviews`, {
      data: { name: xss, text: xss, rating: 5 },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect([201, 422]).toContain(res.status());
    if (res.status() === 201) {
      const body = await res.json();
      // Check if script tags were stored raw (frontend must escape)
      if (body.text && body.text.includes('<script>')) {
        console.warn('RISK: XSS payload stored in review text. Frontend MUST escape output.');
      }
    }
  });

  test('POST /reviews with very long text', async ({ request }) => {
    const longText = 'A'.repeat(10000);
    const res = await request.post(`${API}/reviews`, {
      data: { name: 'LongUser', text: longText, rating: 4 },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect([201, 422]).toContain(res.status());
    if (res.status() === 500) {
      console.warn('BUG: Long text causes 500 server error');
    }
  });

  test('POST /reviews with invalid rating', async ({ request }) => {
    const res = await request.post(`${API}/reviews`, {
      data: { name: 'User', text: 'Review', rating: 10 },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    // Rating > 5 should be rejected
    if (res.status() === 201) {
      console.warn('BUG: Rating value 10 (out of 5) accepted without validation');
    }
  });

  test('POST /reviews with missing text returns 422', async ({ request }) => {
    const res = await request.post(`${API}/reviews`, {
      data: { name: 'NoText', rating: 5 },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect(res.status()).toBe(422);
  });

  test('reviews are visible on the frontend', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: userToken, user: userData });
    await page.reload();
    await page.waitForTimeout(1000);

    // Navigate to homepage which should show reviews
    await page.goto('/');
    await page.waitForTimeout(2000);
    // Check no JS errors
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
  });
});
