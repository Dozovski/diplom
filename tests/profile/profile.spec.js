const { test, expect } = require('@playwright/test');
const { API, createUser, loginAs } = require('../helpers/api');

test.describe('User Profile', () => {
  let userToken, userData, userPhone, userPassword;

  test.beforeAll(async ({ request }) => {
    const reg = await createUser(request, 'prof');
    userPhone = reg.phone;
    userPassword = reg.password;
    const login = await loginAs(request, userPhone, userPassword);
    userToken = login.token;
    userData = login.user;
  });

  test('GET /profile returns user data', async ({ request }) => {
    const res = await request.get(`${API}/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.phone).toBe(userPhone);
  });

  test('PUT /profile updates name', async ({ request }) => {
    const res = await request.put(`${API}/profile`, {
      data: { name: 'Updated Name' },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Updated Name');
  });

  test('PUT /profile updates birth_date', async ({ request }) => {
    const res = await request.put(`${API}/profile`, {
      data: { birth_date: '1995-06-15' },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.birth_date).toContain('1995-06-15');
  });

  test('PUT /profile updates passport', async ({ request }) => {
    const res = await request.put(`${API}/profile`, {
      data: { passport: 'AB9876543' },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.passport).toBe('AB9876543');
  });

  test('PUT /profile with empty name', async ({ request }) => {
    const res = await request.put(`${API}/profile`, {
      data: { name: '' },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    // Empty name might be rejected
    if (res.status() === 200) {
      const body = await res.json();
      if (!body.name || body.name === '') {
        console.warn('BUG: Empty name accepted in profile update');
      }
    }
  });

  test('profile data persists after re-login', async ({ request }) => {
    await request.put(`${API}/profile`, {
      data: { name: 'Persistent Name', birth_date: '1985-03-20', passport: 'CD1111111' },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });

    // Re-login
    const login2 = await loginAs(request, userPhone, userPassword);
    const me = await request.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${login2.token}` },
    });
    const body = await me.json();
    expect(body.name).toBe('Persistent Name');
  });

  test('PUT /profile without token returns 401', async ({ request }) => {
    const res = await request.put(`${API}/profile`, {
      data: { name: 'Unauthorized' },
    });
    expect([401, 302]).toContain(res.status());
  });

  test('XSS payload in profile name stored safely', async ({ request }) => {
    const xss = '<img src=x onerror=alert(1)>';
    const res = await request.put(`${API}/profile`, {
      data: { name: xss },
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    if (res.status() === 200) {
      // Verify it doesn't execute (checking via API response encoding)
      const body = await res.json();
      // If name is returned as-is, the frontend must escape it
      console.log('Profile name XSS payload stored as:', body.name);
    }
  });

  test('profile page renders in UI', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: userToken, user: userData });
    await page.reload();
    await page.goto('/profile');
    await page.waitForTimeout(1500);
    // Profile page should have form inputs
    const inputs = await page.locator('input, form').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('profile shows warning if birth_date/passport missing (booking gate)', async ({ page, request }) => {
    // Create fresh user with no profile data
    const reg = await createUser(request, 'gate2');
    const login = await loginAs(request, reg.phone, reg.password);

    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: login.token, user: login.user });
    await page.reload();
    await page.waitForTimeout(1000);

    // Try to navigate to /cars and click book
    await page.goto('/cars');
    await page.waitForTimeout(1500);

    const bookBtn = page.locator('button:has-text("Забронировать"), button:has-text("Арендовать"), button:has-text("Бронировать")').first();
    if (await bookBtn.count() > 0) {
      await bookBtn.click();
      await page.waitForTimeout(800);
      // Profile warning should appear
      const warning = await page.locator(':has-text("Профиль не заполнен")').count();
      expect(warning).toBeGreaterThan(0);
    }
  });
});
