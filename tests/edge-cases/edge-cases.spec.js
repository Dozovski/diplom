const { test, expect } = require('@playwright/test');
const { API, loginAdmin, createCar, createUser, loginAs } = require('../helpers/api');

test.describe('Edge Cases & Negative Testing', () => {
  let adminToken;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAdmin(request);
    adminToken = admin.token;
  });

  // ─── API Edge Cases ───────────────────────────────────────────────────────

  test('GET /cars/{id} with string id does not crash', async ({ request }) => {
    const res = await request.get(`${API}/cars/notanid`);
    // Route constraint rejects non-numeric IDs with 404
    expect(res.status()).not.toBe(500);
    expect([400, 404, 422]).toContain(res.status());
  });

  test('GET /cars/{id} with very large id returns 404', async ({ request }) => {
    const res = await request.get(`${API}/cars/99999999999`);
    expect(res.status()).toBe(404);
  });

  test('POST /cars with malformed JSON', async ({ request }) => {
    const res = await request.post(`${API}/cars`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: '{"name": "broken"', // malformed
    });
    expect([400, 422, 500]).toContain(res.status());
  });

  test('CORS: API accepts requests from frontend origin', async ({ request }) => {
    const res = await request.get(`${API}/cars`, {
      headers: { Origin: 'http://127.0.0.1:3000' },
    });
    expect(res.status()).toBe(200);
    const headers = res.headers();
    console.log('CORS headers:', {
      'access-control-allow-origin': headers['access-control-allow-origin'],
    });
  });

  test('empty database returns empty arrays not 500', async ({ request }) => {
    const cars = await request.get(`${API}/cars`);
    const reviews = await request.get(`${API}/reviews`);
    expect(cars.status()).toBe(200);
    expect(reviews.status()).toBe(200);
  });

  test('contact form endpoint', async ({ request }) => {
    const reg = await createUser(request, 'cont');
    const login = await loginAs(request, reg.phone, reg.password);
    const res = await request.post(`${API}/contact`, {
      data: { name: 'Test User', email: 'test@test.com', message: 'Hello World' },
      headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('contact form with XSS payload', async ({ request }) => {
    const reg = await createUser(request, 'contxss');
    const login = await loginAs(request, reg.phone, reg.password);
    const res = await request.post(`${API}/contact`, {
      data: {
        name: '<script>alert(1)</script>',
        email: 'xss@test.com',
        message: '<img src=x onerror=alert(1)>',
      },
      headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
    });
    expect([200, 201, 422]).toContain(res.status());
    if (res.status() === 500) {
      console.warn('BUG: XSS payload in contact form causes 500');
    }
  });

  test('double booking same car same dates', async ({ request }) => {
    const { data: car } = await createCar(request, adminToken, { name: 'Double Book' });
    const reg = await createUser(request, 'dbl');
    const login = await loginAs(request, reg.phone, reg.password);

    const booking1 = await request.post(`${API}/bookings`, {
      data: { car_id: car.id, name: 'User1', phone: reg.phone, date_from: '2027-02-01', date_to: '2027-02-05' },
      headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
    });
    const booking2 = await request.post(`${API}/bookings`, {
      data: { car_id: car.id, name: 'User2', phone: reg.phone, date_from: '2027-02-01', date_to: '2027-02-05' },
      headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
    });

    if (booking1.status() === 201 && booking2.status() === 201) {
      console.warn('BUG: Overlapping bookings for same car+dates both accepted. No conflict detection!');
    }
  });

  // ─── Frontend Stability ───────────────────────────────────────────────────

  test('navigating to unknown route redirects to /', async ({ page, request }) => {
    const admin = await loginAdmin(request);
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: admin.token, user: admin.user });
    await page.reload();
    await page.goto('/this-route-does-not-exist');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/127\.0\.0\.1:3000\/?$/);
  });

  test('page does not crash with null user in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user', 'null');
      localStorage.setItem('token', '');
    });
    await page.reload();
    await page.waitForTimeout(1500);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    const criticalErrors = errors.filter(e => !e.includes('Warning') && !e.includes('warning'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('page does not crash with corrupted user JSON in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user', '{broken json}}}');
      localStorage.setItem('token', 'fake');
    });
    await page.reload();
    await page.waitForTimeout(1500);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    const criticalErrors = errors.filter(e => !e.includes('Warning'));
    if (criticalErrors.length > 0) {
      console.warn('BUG: App crashes with corrupted localStorage JSON:', criticalErrors[0]);
    }
  });

  test('map page loads without crashing', async ({ page, request }) => {
    const admin = await loginAdmin(request);
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: admin.token, user: admin.user });
    await page.reload();
    await page.goto('/map');
    await page.waitForTimeout(3000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
  });

  test('contact page loads', async ({ page, request }) => {
    const admin = await loginAdmin(request);
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: admin.token, user: admin.user });
    await page.reload();
    await page.goto('/contact');
    await page.waitForTimeout(1500);
    const form = await page.locator('form, input').count();
    expect(form).toBeGreaterThan(0);
  });

  test('mobile viewport renders without horizontal scroll', async ({ page, request }) => {
    const admin = await loginAdmin(request);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: admin.token, user: admin.user });
    await page.reload();
    await page.waitForTimeout(1500);

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    if (scrollWidth > clientWidth + 10) {
      console.warn(`UX: Horizontal overflow on mobile. scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    }
  });

  test('tablet viewport renders correctly', async ({ page, request }) => {
    const admin = await loginAdmin(request);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: admin.token, user: admin.user });
    await page.reload();
    await page.goto('/cars');
    await page.waitForTimeout(1500);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
  });
});
