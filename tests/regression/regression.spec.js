const { test, expect } = require('@playwright/test');
const { API, loginAdmin, createCar, createUser, loginAs } = require('../helpers/api');

test.describe('Regression Suite', () => {
  let adminToken, adminUser, testCar;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAdmin(request);
    adminToken = admin.token;
    adminUser = admin.user;
    const { data } = await createCar(request, adminToken, { name: 'Regression Car' });
    testCar = data;
  });

  test('full user journey: register → login → browse → book → view my bookings', async ({ page, request }) => {
    // 1. Register
    const phone = `+375${Math.floor(Math.random()*9e9+1e9)}`.slice(0, 13);
    const regRes = await request.post(`${API}/register`, {
      data: { name: 'Journey User', phone, password: 'journey123' },
    });
    expect(regRes.status()).toBe(200);
    const { token, user } = await regRes.json();

    // 2. Fill profile
    await request.put(`${API}/profile`, {
      data: { birth_date: '1992-05-10', passport: 'EF2222222' },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const meRes = await request.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
    const updatedUser = await meRes.json();

    // 3. Login via UI
    await page.goto('/');
    await page.evaluate(({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    }, { t: token, u: updatedUser });
    await page.reload();
    await page.waitForTimeout(1500);

    // 4. Navigate to cars
    await page.goto('/cars');
    await page.waitForTimeout(2000);

    // 5. Verify no errors
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);

    // 6. Make a booking via API
    const book = await request.post(`${API}/bookings`, {
      data: { car_id: testCar.id, name: 'Journey User', phone, date_from: '2027-03-01', date_to: '2027-03-05' },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    expect(book.status()).toBe(201);

    // 7. View my bookings
    const myBooks = await request.get(`${API}/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(myBooks.status()).toBe(200);
    const books = await myBooks.json();
    expect(books.length).toBeGreaterThan(0);
  });

  test('full admin journey: login → create car → approve booking → delete car', async ({ request }) => {
    // Create user and booking
    const reg = await createUser(request, 'reg');
    const login = await loginAs(request, reg.phone, reg.password);

    // Create car
    const { data: car, status } = await createCar(request, adminToken, { name: 'Admin Journey Car' });
    expect(status).toBe(201);

    // Create booking
    const book = await request.post(`${API}/bookings`, {
      data: { car_id: car.id, name: 'Booking User', phone: reg.phone, date_from: '2027-04-01', date_to: '2027-04-05' },
      headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
    });
    expect(book.status()).toBe(201);
    const { id: bookingId } = await book.json();

    // Admin approves
    const approve = await request.patch(`${API}/bookings/${bookingId}`, {
      data: { status: 'approved' },
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
    });
    expect(approve.status()).toBe(200);

    // Admin deletes car
    const del = await request.delete(`${API}/cars/${car.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(del.status()).toBe(200);

    // Verify car gone
    const gone = await request.get(`${API}/cars/${car.id}`);
    expect(gone.status()).toBe(404);
  });

  test('token from one session does not work after logout + re-login', async ({ request }) => {
    const reg = await createUser(request, 'sess');
    const login1 = await loginAs(request, reg.phone, reg.password);
    const token1 = login1.token;

    // Logout
    await request.post(`${API}/logout`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    // Re-login
    const login2 = await loginAs(request, reg.phone, reg.password);
    const token2 = login2.token;

    // Old token should not work
    const me = await request.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    expect([401, 302]).toContain(me.status());

    // New token should work
    const me2 = await request.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    expect(me2.status()).toBe(200);
  });

  test('car availability toggle affects listing', async ({ request }) => {
    const { data: car } = await createCar(request, adminToken, { name: 'Avail Reg Car', available: true });

    // Set unavailable
    const patch = await request.patch(`${API}/cars/${car.id}/availability`, {
      data: { available: false },
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
    });
    expect(patch.status()).toBe(200);

    const get = await request.get(`${API}/cars/${car.id}`);
    const body = await get.json();
    expect(body.available).toBe(false);

    // Re-enable
    const patch2 = await request.patch(`${API}/cars/${car.id}/availability`, {
      data: { available: true },
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
    });
    expect(patch2.status()).toBe(200);
    const get2 = await request.get(`${API}/cars/${car.id}`);
    expect((await get2.json()).available).toBe(true);
  });

  test('bookings page renders for logged-in user', async ({ page, request }) => {
    const reg = await createUser(request, 'bkpg');
    const login = await loginAs(request, reg.phone, reg.password);
    await page.goto('/');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }, { token: login.token, user: login.user });
    await page.reload();
    await page.goto('/bookings');
    await page.waitForTimeout(2000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('Warning'))).toHaveLength(0);
  });
});
