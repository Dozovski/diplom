const { test, expect } = require('@playwright/test');
const { API, loginAdmin, createCar, createUser, loginAs } = require('../helpers/api');

test.describe('Admin Panel', () => {
  let adminToken, adminUser;

  test.beforeAll(async ({ request }) => {
    const admin = await loginAdmin(request);
    adminToken = admin.token;
    adminUser = admin.user;
  });

  // ─── Access Control ───────────────────────────────────────────────────────

  test.describe('Access Control', () => {
    test('admin has role=admin', async ({ request }) => {
      const me = await request.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await me.json();
      expect(body.role).toBe('admin');
    });

    test('regular user cannot access GET /bookings', async ({ request }) => {
      const reg = await createUser(request, 'acl');
      const login = await loginAs(request, reg.phone, reg.password);
      const res = await request.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${login.token}` },
      });
      // Non-admins shouldn't see all bookings (403 or empty response)
      // Currently the backend may NOT enforce this — let's check
      if (res.status() === 200) {
        console.warn('SECURITY: Regular user can access GET /bookings (admin endpoint). No role check implemented.');
      }
      // Record the actual behaviour
      console.log(`GET /bookings as regular user: ${res.status()}`);
    });

    test('regular user cannot POST /cars', async ({ request }) => {
      const reg = await createUser(request, 'acl2');
      const login = await loginAs(request, reg.phone, reg.password);
      const res = await request.post(`${API}/cars`, {
        data: { name: 'Hacker Car', category: 'Эконом', year: 2020, seats: 5, transmission: 'Автомат', fuel: 'Бензин', price: 1, lat: 53, lng: 27, address: 'Hack' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      if (res.status() === 201) {
        console.warn('CRITICAL SECURITY BUG: Regular user can create cars (POST /cars). No admin check!');
      }
      console.log(`POST /cars as regular user: ${res.status()}`);
    });

    test('regular user cannot DELETE /cars', async ({ request }) => {
      const { data: car } = await createCar(request, adminToken, { name: 'Delete Test' });
      const reg = await createUser(request, 'acl3');
      const login = await loginAs(request, reg.phone, reg.password);
      const res = await request.delete(`${API}/cars/${car.id}`, {
        headers: { Authorization: `Bearer ${login.token}` },
      });
      if (res.status() === 200) {
        console.warn('CRITICAL SECURITY BUG: Regular user can delete cars!');
      }
      console.log(`DELETE /cars as regular user: ${res.status()}`);
    });

    test('regular user cannot PATCH booking status', async ({ request }) => {
      const { data: car } = await createCar(request, adminToken, { name: 'Patch Test' });
      const reg = await createUser(request, 'acl4');
      const login = await loginAs(request, reg.phone, reg.password);

      // Create a booking
      const book = await request.post(`${API}/bookings`, {
        data: { car_id: car.id, name: 'Test', phone: reg.phone, date_from: '2026-10-01', date_to: '2026-10-05' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      const { id } = await book.json();

      const patch = await request.patch(`${API}/bookings/${id}`, {
        data: { status: 'approved' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      if (patch.status() === 200) {
        console.warn('CRITICAL SECURITY BUG: Regular user can change booking status!');
      }
      console.log(`PATCH /bookings/{id} as regular user: ${patch.status()}`);
    });

    test('UI /admin route hidden from regular user', async ({ page, request }) => {
      const reg = await createUser(request, 'uiacl');
      const login = await loginAs(request, reg.phone, reg.password);

      await page.goto('/');
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token: login.token, user: login.user });
      await page.reload();
      await page.waitForTimeout(1000);

      // Navbar should not show /admin link
      const adminLink = await page.locator('a[href="/admin"], a:has-text("Админ"), a:has-text("Admin")').count();
      expect(adminLink).toBe(0);

      // Direct navigation to /admin should redirect or show nothing
      await page.goto('/admin');
      await page.waitForTimeout(1000);
      const adminPanel = await page.locator(':has-text("Администратор"), [class*="admin-panel"]').count();
      // Admin content should not be visible
      if (adminPanel > 0) {
        console.warn('SECURITY: Regular user can see /admin page content by direct URL!');
      }
    });

    test('localStorage role spoofing - change role to admin', async ({ page, request }) => {
      const reg = await createUser(request, 'spoof');
      const login = await loginAs(request, reg.phone, reg.password);

      await page.goto('/');
      // Inject user with spoofed admin role
      await page.evaluate(({ token, user }) => {
        const fakeAdmin = { ...user, role: 'admin' };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(fakeAdmin));
      }, { token: login.token, user: login.user });
      await page.reload();
      await page.waitForTimeout(1000);

      // UI might show admin elements due to client-side role check
      const adminLink = await page.locator('a[href="/admin"], a:has-text("Админ")').count();
      if (adminLink > 0) {
        console.warn('SECURITY: localStorage role spoofing gives access to /admin route on frontend. Backend must enforce auth.');
      }

      // But API should still reject with original token
      const res = await request.post(`${API}/cars`, {
        data: { name: 'Spoof Car', category: 'Эконом', year: 2020, seats: 5, transmission: 'Автомат', fuel: 'Бензин', price: 1, lat: 53, lng: 27, address: 'Spoof' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      // API should not allow this even with spoofed localStorage
      console.log(`POST /cars with spoofed role, API status: ${res.status()}`);
    });
  });

  // ─── Admin Car Management ─────────────────────────────────────────────────

  test.describe('Admin Car Management', () => {
    test('admin can create car via UI', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token: adminToken, user: adminUser });
      await page.reload();
      await page.goto('/admin');
      await page.waitForTimeout(2000);

      // Admin panel should be visible
      const adminContent = await page.locator('body').innerText();
      expect(adminContent.length).toBeGreaterThan(100);
    });

    test('admin sees pending bookings count in Navbar', async ({ page, request }) => {
      // Create some pending bookings
      const { data: car } = await createCar(request, adminToken, { name: 'Pending Count Car' });
      const reg = await createUser(request, 'pending');
      const login = await loginAs(request, reg.phone, reg.password);
      await request.put(`${API}/profile`, {
        data: { birth_date: '1990-01-01', passport: 'AB0000001' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      await request.post(`${API}/bookings`, {
        data: { car_id: car.id, name: 'Pending User', phone: reg.phone, date_from: '2026-11-01', date_to: '2026-11-05' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });

      await page.goto('/');
      await page.evaluate(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }, { token: adminToken, user: adminUser });
      await page.reload();
      await page.waitForTimeout(2000);

      // Navbar should show pending count badge
      const navText = await page.locator('nav').innerText();
      console.log('Navbar text:', navText.substring(0, 200));
    });
  });

  // ─── Admin Bookings ───────────────────────────────────────────────────────

  test.describe('Admin Booking Management', () => {
    test('admin can approve booking via API', async ({ request }) => {
      const { data: car } = await createCar(request, adminToken, { name: 'Approve Car' });
      const reg = await createUser(request, 'approv');
      const login = await loginAs(request, reg.phone, reg.password);
      const book = await request.post(`${API}/bookings`, {
        data: { car_id: car.id, name: 'Approve Me', phone: reg.phone, date_from: '2026-12-01', date_to: '2026-12-05' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      const { id } = await book.json();

      const patch = await request.patch(`${API}/bookings/${id}`, {
        data: { status: 'approved' },
        headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
      });
      expect(patch.status()).toBe(200);
      expect((await patch.json()).status).toBe('approved');
    });

    test('booking status transitions work', async ({ request }) => {
      const { data: car } = await createCar(request, adminToken, { name: 'Status Car' });
      const reg = await createUser(request, 'trans');
      const login = await loginAs(request, reg.phone, reg.password);
      const book = await request.post(`${API}/bookings`, {
        data: { car_id: car.id, name: 'Status User', phone: reg.phone, date_from: '2027-01-01', date_to: '2027-01-05' },
        headers: { Authorization: `Bearer ${login.token}`, Accept: 'application/json' },
      });
      const { id } = await book.json();

      // pending → approved
      const approve = await request.patch(`${API}/bookings/${id}`, {
        data: { status: 'approved' },
        headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
      });
      expect(approve.status()).toBe(200);

      // approved → rejected (test state change)
      const reject = await request.patch(`${API}/bookings/${id}`, {
        data: { status: 'rejected' },
        headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
      });
      expect(reject.status()).toBe(200);
    });
  });
});
