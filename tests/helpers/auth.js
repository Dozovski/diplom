const { API } = require('./api');

async function loginViaUI(page, phone, password) {
  await page.goto('/');
  await page.waitForSelector('input[type="tel"], input[placeholder*="телефон"], input[placeholder*="номер"], input[name="phone"]', { timeout: 10000 });
  const phoneInput = page.locator('input[type="tel"], input[placeholder*="телефон"], input[placeholder*="номер"], input[name="phone"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await phoneInput.fill(phone);
  await passInput.fill(password);
  await page.locator('button[type="submit"], button:has-text("Войти"), button:has-text("Вход")').first().click();
  await page.waitForURL('/', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function injectAuth(page, token, user) {
  await page.goto('/');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });
  await page.reload();
  await page.waitForTimeout(1000);
}

async function clearAuth(page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });
}

module.exports = { loginViaUI, injectAuth, clearAuth };
