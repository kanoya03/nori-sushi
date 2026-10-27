import { test, expect, type Page } from '@playwright/test';
import { categories, products } from './fixtures';

const api = 'https://nori-sushi.onrender.com';
const sessionKey = 'nori-web-session';
const guestKey = 'nori-web-guest-favorites';
const cartKey = 'nori-web-cart';
const user = {
  id: 42,
  firstName: 'Nori',
  lastName: 'Tester',
  gender: null,
  birthDate: null,
  email: null,
  contactEmail: 'nori@example.test',
  telegramId: '42',
  googleId: null,
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
};
const token = `test.${Buffer.from(JSON.stringify({ sub: 42, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;

async function seedSession(page: Page, savedToken = token) {
  await page.addInitScript(
    ({ key, value }) => {
      if (!sessionStorage.getItem('test-seeded')) {
        sessionStorage.setItem(key, value);
        sessionStorage.setItem('test-seeded', 'yes');
      }
    },
    { key: sessionKey, value: savedToken },
  );
}

test.beforeEach(async ({ page }) => {
  // Prevent these tests from reaching the real account/database endpoints.
  await page.route(`${api}/**`, (route) => route.abort());
  await page.route(`${api}/categories`, (route) => route.fulfill({ json: categories }));
  await page.route(`${api}/products`, (route) => route.fulfill({ json: products }));
  await page.route(`${api}/products/*`, (route) => {
    const product = products.find(
      (value) => String(value.id) === route.request().url().split('/').pop(),
    );
    return route.fulfill(
      product ? { json: product } : { status: 404, json: { message: 'Product not found' } },
    );
  });
  await page.route(`${api}/auth/me`, (route) => route.fulfill({ json: user }));
  await page.route(`${api}/favorites`, (route) => route.fulfill({ json: [] }));
  await page.route('https://images.example.test/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f3f3f3"/></svg>',
    }),
  );
  await page.route('https://accounts.google.com/gsi/client', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `
      let callback;
      window.google = { accounts: { id: {
        initialize(options) { callback = options.callback; },
        renderButton(element) {
          const button = document.createElement('button');
          button.textContent = 'Sign in with Google';
          button.onclick = () => callback({ credential: 'test-google-id-token' });
          element.append(button);
        },
        disableAutoSelect() {}
      } } };
    `,
    }),
  );
});

test('product details and cart persist quantities and use refreshed prices', async ({ page }) => {
  await page.goto('/menu');
  await page
    .getByRole('article')
    .first()
    .getByRole('link', { name: 'Philadelphia', exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\/1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Philadelphia');
  await expect(page.locator('.detail-description')).toHaveText('Salmon, cream cheese, cucumber');
  await page.getByRole('button', { name: 'Increase quantity of Philadelphia' }).click();
  await page.getByRole('button', { name: 'Add Philadelphia to cart', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Cart, 2 items', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View cart' }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$18.7');
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), cartKey)).toEqual([
    { productId: 1, quantity: 2 },
  ]);
  await page.route(`${api}/products`, (route) =>
    route.fulfill({ json: products.map((product) => ({ ...product, price: 4600 })) }),
  );
  await page.reload();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$20.0');
  await page.getByRole('button', { name: 'Decrease quantity of Philadelphia' }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$10.0');
  await page.getByRole('button', { name: 'Русский', exact: true }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('4\u00a0600 ₸');
  await page.getByRole('button', { name: 'Удалить «Филадельфия» из корзины' }).click();
  await expect(page.getByRole('heading', { name: 'Ваша корзина пуста' })).toBeVisible();
});

test('unavailable cart products remain removable and cannot contribute stale prices', async ({
  page,
}) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(key, JSON.stringify([{ productId: 999, quantity: 2, price: 500 }])),
    cartKey,
  );
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Unavailable dish #999' })).toBeVisible();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$0.0');
  await page.getByRole('button', { name: 'Remove Unavailable dish #999 from cart' }).click();
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
});

test('guest favorites persist and render current catalog data', async ({ page }) => {
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Save Philadelphia to favorites' }).click();
  await page.goto('/favorites');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.route(`${api}/products`, (route) =>
    route.fulfill({
      json: products.map((product) =>
        product.id === 1 ? { ...product, nameEn: 'Updated roll', price: 4600 } : product,
      ),
    }),
  );
  await page.reload();
  await expect(page.getByRole('article')).toContainText('Updated roll');
  await expect(page.getByRole('article')).toContainText('$10.0');
  await page.getByRole('button', { name: 'Remove Updated roll from favorites' }).click();
  await expect(page.getByRole('heading', { name: 'Make room for your favourites' })).toBeVisible();
});

test('Telegram session rate limit explains when to retry', async ({ page }) => {
  await page.route(`${api}/auth/telegram/start`, (route) =>
    route.fulfill({
      status: 429,
      json: { message: 'Too many requests', code: 'RATE_LIMITED', retryAfter: 60 },
      headers: { 'Retry-After': '60' },
    }),
  );
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Continue with Telegram' }).click();
  await expect(page.getByRole('alert')).toContainText('Too many sign-in attempts');
  await expect(page.getByRole('button', { name: 'Continue with Telegram' })).toBeEnabled();
});

test('a locked Telegram code asks for a new session', async ({ page }) => {
  await page.route(`${api}/auth/telegram/start`, (route) =>
    route.fulfill({
      json: { sessionToken: 'test-token', telegramUrl: 'https://t.me/nori_bot?start=test-token' },
    }),
  );
  await page.route(`${api}/auth/telegram/verify`, (route) =>
    route.fulfill({ status: 429, json: { message: 'Locked', code: 'TELEGRAM_SESSION_LOCKED' } }),
  );
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Continue with Telegram' }).click();
  await page.getByLabel('Six-digit code').fill('000000');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('locked after five incorrect attempts');
  await expect(page.getByRole('button', { name: 'Start again with a new code' })).toBeEnabled();
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull();
  await page.getByRole('button', { name: 'Start again with a new code' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('Six-digit code')).toHaveValue('');
});

test('Telegram sign-in validates the code, restores the user and separates account favorites', async ({
  page,
}) => {
  await page.addInitScript((key) => localStorage.setItem(key, '[1]'), guestKey);
  await page.route(`${api}/auth/telegram/start`, (route) =>
    route.fulfill({
      json: {
        sessionToken: 'test-telegram-session',
        telegramUrl: 'https://t.me/nori_test_bot?start=test-telegram-session',
      },
    }),
  );
  await page.route(`${api}/auth/telegram/verify`, async (route) => {
    const body = route.request().postDataJSON();
    expect(body.sessionToken).toBe('test-telegram-session');
    await route.fulfill(
      body.code === '123456'
        ? { json: { accessToken: token, user } }
        : { status: 401, json: { message: 'Invalid verification code' } },
    );
  });
  await page.route(`${api}/favorites`, async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
    await route.fulfill({ json: [{ id: 7, productId: 13, product: products[2] }] });
  });
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Continue with Telegram' }).click();
  await expect(page.getByRole('link', { name: 'Open Telegram' })).toHaveAttribute(
    'href',
    'https://t.me/nori_test_bot?start=test-telegram-session',
  );
  await page.getByLabel('Six-digit code').fill('000000');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('The code is invalid or expired');
  await page.getByLabel('Six-digit code').fill('123456');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Nori Tester' })).toBeVisible();
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBe(token);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(token);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nori Tester' })).toBeVisible();
  await page.goto('/favorites');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('Drink');
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull();
  await page.goto('/favorites');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('Philadelphia');
});

test('Google exchanges an ID token through the existing backend endpoint', async ({ page }) => {
  await page.route(`${api}/auth/google`, async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ idToken: 'test-google-id-token' });
    await route.fulfill({
      json: {
        accessToken: token,
        user: {
          ...user,
          email: 'nori@example.test',
          contactEmail: 'orders@example.test',
          googleId: 'test-google-user',
          telegramId: null,
        },
      },
    });
  });
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  await expect(page.getByRole('heading', { name: 'Nori Tester' })).toBeVisible();
  await expect(page.locator('.profile-fields')).toContainText('Google');
  await expect(page.locator('.profile-fields')).toContainText('nori@example.test');
  await expect(page.locator('.profile-fields')).toContainText('orders@example.test');
});

test('restores a session while the older API is still missing contactEmail', async ({ page }) => {
  await seedSession(page);
  const oldUser: Record<string, unknown> = { ...user };
  delete oldUser.contactEmail;
  await page.route(`${api}/auth/me`, (route) => route.fulfill({ json: oldUser }));

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Nori Tester' })).toBeVisible();
});

test('failed session restore preserves the token for retry, while a 401 clears it', async ({
  page,
}) => {
  await seedSession(page);
  let attempt = 0;
  await page.route(`${api}/auth/me`, (route) =>
    route.fulfill(++attempt === 1 ? { status: 503, body: 'offline' } : { json: user }),
  );
  await page.goto('/profile');
  await expect(page.getByRole('alert')).toContainText('We couldn’t restore your session');
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBe(token);
  await page.locator('.back-link').click();
  await expect(page.getByRole('alert')).toContainText('We couldn’t restore your session');
  await expect(page.getByRole('button', { name: 'Save Philadelphia to favorites' })).toBeDisabled();
  await page.getByRole('alert').getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'Nori Tester' })).toBeVisible();
  await page.route(`${api}/auth/me`, (route) =>
    route.fulfill({ status: 401, json: { message: 'Invalid access token' } }),
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Your session has expired');
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull();
});

test('expired saved tokens are removed before an authenticated request', async ({ page }) => {
  const expired = `test.${Buffer.from(JSON.stringify({ exp: 1, sub: 42 })).toString('base64url')}.test`;
  await seedSession(page, expired);
  let calls = 0;
  await page.route(`${api}/auth/me`, (route) => {
    calls += 1;
    return route.fulfill({ json: user });
  });
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull();
  expect(calls).toBe(0);
});

test('authenticated favorite writes use the server and failed writes leave the UI unchanged', async ({
  page,
}) => {
  await seedSession(page);
  let saved = false;
  let writes = 0;
  await page.route(`${api}/favorites`, (route) =>
    route.fulfill({ json: saved ? [{ id: 1, productId: 1, product: products[0] }] : [] }),
  );
  await page.route(`${api}/favorites/1`, async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
    if (route.request().method() === 'POST') {
      writes += 1;
      if (writes === 1) {
        await route.fulfill({ status: 500, body: 'offline' });
        return;
      }
      saved = true;
    } else {
      expect(route.request().method()).toBe('DELETE');
      saved = false;
    }
    await route.fulfill({ json: { success: true } });
  });
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Save Philadelphia to favorites' }).click();
  await expect(page.getByRole('alert')).toContainText('We couldn’t save that change');
  await expect(
    page.getByRole('button', { name: 'Save Philadelphia to favorites' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Save Philadelphia to favorites' }).click();
  await expect(
    page.getByRole('button', { name: 'Remove Philadelphia from favorites' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/favorites');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove Philadelphia from favorites' }).click();
  await expect(page.getByRole('heading', { name: 'Make room for your favourites' })).toBeVisible();
  expect(saved).toBe(false);
});

test('logout ignores a late favorites load from the previous account', async ({ page }) => {
  await seedSession(page);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`${api}/favorites`, async (route) => {
    await pending;
    await route.fulfill({ json: [{ id: 1, productId: 13, product: products[2] }] });
  });
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Nori Tester' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  const finished = page.waitForResponse(`${api}/favorites`);
  release();
  await finished;
  await page.locator('.profile-shortcut').filter({ hasText: 'Favorites' }).click();
  await expect(page.getByRole('heading', { name: 'Make room for your favourites' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('a protected favorite request that returns 401 signs the user out', async ({ page }) => {
  await seedSession(page);
  await page.route(`${api}/favorites/1`, (route) =>
    route.fulfill({ status: 401, json: { message: 'Expired token' } }),
  );
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Save Philadelphia to favorites' }).click();
  await expect(page.locator('.notice').first()).toContainText('Your session has expired');
  expect(await page.evaluate((key) => sessionStorage.getItem(key), sessionKey)).toBeNull();
});

test('missing product and Google SDK errors have usable recovery', async ({ page }) => {
  await page.goto('/products/999');
  await expect(
    page.getByRole('heading', { name: 'This dish is no longer on the menu' }),
  ).toBeVisible();
  await page.route('https://accounts.google.com/gsi/client', (route) => route.abort());
  await page.goto('/profile');
  await expect(page.getByRole('alert')).toContainText('Google sign-in couldn’t load');
  await expect(page.getByRole('button', { name: 'Continue with Telegram' })).toBeEnabled();
});

test('blocked browser storage keeps the cart usable in memory', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page.goto('/menu');
  await page.getByRole('button', { name: 'Add Philadelphia to cart', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable');
  await page.getByRole('link', { name: 'Cart, 1 item', exact: true }).click();
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$9.3');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
