import { test, expect, type Page } from '@playwright/test';
import { categories, products } from './fixtures';

const api = 'https://nori-sushi.onrender.com';
const user = {
  id: 42,
  firstName: 'Nori',
  lastName: 'Tester',
  gender: null,
  birthDate: null,
  email: null,
  contactEmail: 'nori@example.test',
  phone: '+77011234567',
  telegramId: '42',
  googleId: null,
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
};
const token = `test.${Buffer.from(JSON.stringify({ sub: 42, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
const address = {
  id: 8,
  city: 'Milano',
  street: 'Via Torino',
  house: '12',
  apartment: '4',
  entrance: 'A',
  floor: '2',
  comment: null,
  latitude: 45.4614,
  longitude: 9.1856,
  isDefault: true,
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
};
const makeOrder = (guest = false) => ({
  recipientPhone: '+77011234567',
  id: 71,
  userId: guest ? null : 42,
  ...(guest ? { guestToken: 'guest-secret' } : {}),
  status: 'PENDING',
  subtotal: 8580,
  deliveryFee: 700,
  totalPrice: 9280,
  deliveryType: 'DELIVERY',
  paymentMethod: 'CARD_ON_DELIVERY',
  address: 'Milano, Via Torino, 12, apt. 4, entrance A, floor 2',
  comment: null,
  items: [
    {
      id: 1,
      orderId: 71,
      productId: 1,
      quantity: 2,
      productName: 'Philadelphia',
      unitPrice: 4290,
      product: { id: 1, name: 'Филадельфия', nameEn: 'Philadelphia' },
    },
  ],
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
});

async function baseApi(page: Page) {
  await page.route(`${api}/**`, (route) => route.abort());
  await page.route(`${api}/categories`, (route) => route.fulfill({ json: categories }));
  await page.route(`${api}/products`, (route) => route.fulfill({ json: products }));
  await page.route(`${api}/auth/me`, (route) => route.fulfill({ json: user }));
  await page.route(`${api}/favorites`, (route) => route.fulfill({ json: [] }));
  await page.route(`${api}/addresses`, (route) => route.fulfill({ json: [address] }));
  await page.route('https://images.example.test/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>',
    }),
  );
  await page.addInitScript(() => {
    localStorage.setItem('nori-web-cart', JSON.stringify([{ productId: 1, quantity: 2 }]));
    if (!localStorage.getItem('nori-web-guest-phone')) {
      localStorage.setItem('nori-web-guest-phone', '+77011234567');
    }
  });
}
async function seedAuth(page: Page) {
  await page.addInitScript((value) => sessionStorage.setItem('nori-web-session', value), token);
}

test.beforeEach(async ({ page }) => baseApi(page));

test('recipient phone is validated and remembered for the next guest order', async ({ page }) => {
  let posted: Record<string, unknown> | undefined;
  await page.route(`${api}/orders/guest`, async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: { ...makeOrder(true), recipientPhone: posted?.recipientPhone } });
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.getByLabel('Phone number', { exact: true }).fill('+7123');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('alert')).toContainText('Enter a valid phone number');
  expect(posted).toBeUndefined();
  await page.getByLabel('Phone number', { exact: true }).fill('+39 (333) 123-4567');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/guest-orders\/71$/);
  expect(posted?.recipientPhone).toBe('+393331234567');
  expect(await page.evaluate(() => localStorage.getItem('nori-web-guest-phone'))).toBe(
    '+393331234567',
  );
  await page.goto('/checkout');
  await expect(page.getByLabel('Phone number', { exact: true })).toHaveValue('+393331234567');
});

test('an account uses its saved phone and does not inherit the guest phone', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/checkout');
  await expect(page.getByLabel('Phone number', { exact: true })).toHaveValue('+77011234567');
  await page.route(`${api}/auth/me`, (route) =>
    route.fulfill({ json: { ...user, id: 43, phone: null } }),
  );
  await page.reload();
  await expect(page.getByLabel('Phone number', { exact: true })).toHaveValue('');
});

test('guest delivery submits a backend-priced order, stores its private reference and clears cart only on success', async ({
  page,
}) => {
  let posted: Record<string, unknown> | undefined;
  await page.route(`${api}/orders/guest`, async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: makeOrder(true) });
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await expect(page.getByText('$20.2')).toBeVisible();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/guest-orders\/71$/);
  expect(posted).toMatchObject({
    deliveryType: 'DELIVERY',
    paymentMethod: 'CARD_ON_DELIVERY',
    items: [{ productId: 1, quantity: 2 }],
  });
  expect(posted).not.toHaveProperty('totalPrice');
  expect(posted?.address).toBe('Milano, Via Torino, 12');
  expect(await page.evaluate(() => localStorage.getItem('nori-web-cart'))).toBe('[]');
  expect(await page.evaluate(() => sessionStorage.getItem('nori-web-guest-orders'))).toContain(
    'guest-secret',
  );
  await expect(page.getByText('On the way')).toHaveCount(0);
  await expect(page.getByText('Received')).toBeVisible();
  await expect(
    page.getByRole('status').filter({ hasText: 'Order placed successfully' }),
  ).toBeVisible();
});

test('guest retry after a failed response reuses the same order key after reload', async ({
  page,
}) => {
  const posted: Array<Record<string, unknown>> = [];
  await page.route(`${api}/orders/guest`, async (route) => {
    posted.push(route.request().postDataJSON());
    if (posted.length === 1) {
      await route.fulfill({ status: 503, json: { message: 'Response lost' } });
    } else {
      await route.fulfill({ json: makeOrder(true) });
    }
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/checkout$/);
  await expect.poll(() => posted.length).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('nori-web-cart'))).not.toBe('[]');

  await page.route(`${api}/products`, (route) => route.fulfill({ json: [] }));
  await page.reload();
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/guest-orders\/71$/);
  expect(posted).toHaveLength(2);
  expect(posted[0].idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  expect(posted[1].idempotencyKey).toBe(posted[0].idempotencyKey);
});

test('changed prices require another confirmation before an order is submitted', async ({
  page,
}) => {
  let posted: Record<string, unknown> | undefined;
  await page.route(`${api}/orders/guest`, async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: makeOrder(true) });
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.route(`${api}/products`, (route) =>
    route.fulfill({
      json: products.map((product) => (product.id === 1 ? { ...product, price: 4600 } : product)),
    }),
  );
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('alert')).toContainText('Prices or cart contents changed');
  expect(posted).toBeUndefined();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/guest-orders\/71$/);
  expect(posted?.items).toEqual([{ productId: 1, quantity: 2, expectedUnitPrice: 4600 }]);
});

test('failed catalog refresh preserves the cart and does not submit an order', async ({ page }) => {
  let orders = 0;
  await page.route(`${api}/orders/guest`, (route) => {
    orders++;
    return route.fulfill({ json: makeOrder(true) });
  });
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.route(`${api}/products`, (route) => route.abort());
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('alert')).toContainText('could not check current prices');
  expect(orders).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem('nori-web-cart'))).not.toBe('[]');
});

test('a dish removed during checkout is preserved for review and blocks the order', async ({
  page,
}) => {
  let orders = 0;
  await page.route(`${api}/orders/guest`, (route) => {
    orders++;
    return route.fulfill({ json: makeOrder(true) });
  });
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.route(`${api}/products`, (route) =>
    route.fulfill({ json: products.filter((product) => product.id !== 1) }),
  );
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('alert')).toContainText('Remove unavailable dishes');
  expect(orders).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem('nori-web-cart'))).toContain(
    '"productId":1',
  );
});

test('a server price conflict refreshes the cart and keeps the attempt key', async ({ page }) => {
  const posted: Array<{ idempotencyKey: string; items: Array<{ expectedUnitPrice: number }> }> = [];
  let changed = false;
  await page.route(`${api}/products`, (route) =>
    route.fulfill({
      json: products.map((product) =>
        changed && product.id === 1 ? { ...product, price: 4600 } : product,
      ),
    }),
  );
  await page.route(`${api}/orders/guest`, (route) => {
    posted.push(route.request().postDataJSON());
    changed = true;
    return route.fulfill(
      posted.length === 1
        ? { status: 409, json: { message: 'Prices changed', code: 'CART_CHANGED' } }
        : { json: makeOrder(true) },
    );
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('alert')).toContainText('Prices or cart contents changed');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/guest-orders\/71$/);
  expect(posted).toHaveLength(2);
  expect(posted[0].idempotencyKey).toBe(posted[1].idempotencyKey);
  expect(posted[1].items[0].expectedUnitPrice).toBe(4600);
});

test('order rate limit keeps the cart and explains when to retry', async ({ page }) => {
  await page.route(`${api}/orders/guest`, (route) =>
    route.fulfill({
      status: 429,
      json: { message: 'Too many requests', code: 'RATE_LIMITED', retryAfter: 60 },
    }),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('alert')).toContainText('Orders are being submitted too often');
  expect(await page.evaluate(() => localStorage.getItem('nori-web-cart'))).not.toBe('[]');
  expect(
    await page.evaluate(() => sessionStorage.getItem('nori-web-order-attempt')),
  ).not.toBeNull();
});

test('pickup requires and submits one of the mobile pickup points with zero delivery fee', async ({
  page,
}) => {
  let posted: Record<string, unknown> | undefined;
  await page.route(`${api}/orders/guest`, async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: makeOrder(true) });
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/checkout');
  await page.getByRole('button', { name: /Pickup/ }).click();
  await expect(page.getByText('Free')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled();
  await page.getByRole('radio', { name: /NORI SUSHI — Brera/ }).click();
  await expect(page.getByRole('button', { name: 'Place order' })).toBeEnabled();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/guest-orders\/71$/);
  expect(posted).toMatchObject({
    deliveryType: 'PICKUP',
    address: 'NORI SUSHI — Brera, Milano, Via Brera, 23',
  });
});

test('authenticated checkout reuses saved address and submits authenticated order', async ({
  page,
}) => {
  await seedAuth(page);
  let posted: Record<string, unknown> | undefined;
  await page.route(`${api}/orders`, async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: [] });
    }
    posted = route.request().postDataJSON();
    await route.fulfill({ json: makeOrder(false) });
  });
  await page.route(`${api}/orders/71`, (route) => route.fulfill({ json: makeOrder(false) }));
  await page.goto('/checkout');
  await expect(page.getByRole('radio', { name: /Milano, Via Torino/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/orders\/71$/);
  expect(posted).toMatchObject({
    deliveryType: 'DELIVERY',
    address: 'Milano, Via Torino, 12, apt. 4, entrance A, floor 2',
  });
  expect(posted).not.toHaveProperty('subtotal');
});

test('address manager creates and edits addresses without exposing a delete action', async ({
  page,
}) => {
  await seedAuth(page);
  const list = [address];
  await page.route(`${api}/addresses`, async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: list });
    }
    const body = route.request().postDataJSON();
    const created = { ...address, ...body, id: 9, isDefault: false };
    list.unshift(created);
    return route.fulfill({ json: created });
  });
  let patched: Record<string, unknown> | undefined;
  await page.route(`${api}/addresses/*`, async (route) => {
    patched = route.request().postDataJSON();
    const updated = { ...address, ...patched, id: Number(route.request().url().split('/').pop()) };
    return route.fulfill({ json: updated });
  });
  await page.goto('/addresses');
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add address' }).click();
  await expect(page.getByRole('button', { name: 'Add address' })).toHaveCount(0);
  await page.getByLabel('City').fill('Milano');
  await page.getByLabel('Street').fill('Via Brera');
  await page.getByLabel('House').fill('23');
  await page.getByRole('button', { name: 'Save address' }).click();
  await expect(page.getByText('Milano, Via Brera, 23')).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.getByLabel('Floor').fill('3');
  await page.getByRole('button', { name: 'Save address' }).click();
  await expect.poll(() => patched?.floor).toBe('3');
  await expect(page.getByText('Floor 3')).toBeVisible();
});

test('order history exposes details, cancellation and repeat using current catalog products', async ({
  page,
}) => {
  await seedAuth(page);
  let current = makeOrder(false);
  await page.route(`${api}/orders`, (route) => route.fulfill({ json: [current] }));
  await page.route(`${api}/orders/71`, (route) => route.fulfill({ json: current }));
  await page.route(`${api}/orders/71/cancel`, async (route) => {
    current = { ...current, status: 'CANCELLED' };
    await route.fulfill({ json: current });
  });
  await page.goto('/orders');
  await page.getByRole('link', { name: /Order #71/ }).click();
  await expect(page.getByText('Philadelphia').first()).toBeVisible();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Cancel order' }).click();
  await expect(page.getByText('Cancelled')).toBeVisible();
  await page.getByRole('button', { name: 'Order again' }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByTestId('cart-subtotal')).toHaveText('$37.3');
});

test('checkout blocks guest order below mobile minimum', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('nori-web-cart', JSON.stringify([{ productId: 1, quantity: 1 }])),
  );
  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await expect(page.getByText('Minimum order: $10.9')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled();
});

test('Russian checkout uses KZT and keeps the manual address path available without a Mapbox token', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('nori-web-language', 'ru');
  });
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Оформление заказа' })).toBeVisible();
  await expect(page.getByText(/₸/).first()).toBeVisible();
  await expect(page.getByText('Предпросмотр карты недоступен')).toBeVisible();
  await page.getByLabel('Улица').fill('Via Torino');
  await page.getByLabel('Дом').fill('12');
  await expect(page.getByRole('button', { name: 'Подтвердить заказ' })).toBeEnabled();
});

test('selected address survives navigation when session storage writes are blocked', async ({
  page,
}) => {
  await seedAuth(page);
  const alternate = { ...address, id: 9, street: 'Via Brera', house: '23', isDefault: false };
  await page.route(`${api}/addresses`, (route) => route.fulfill({ json: [address, alternate] }));
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'nori-web-selected-address') {
        throw new DOMException('Storage is blocked', 'SecurityError');
      }
      setItem.call(this, key, value);
    };
  });
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/checkout');
  await page.getByRole('link', { name: 'Manage addresses' }).click();
  await page
    .locator('.saved-address')
    .filter({ hasText: 'Via Brera' })
    .getByRole('button', { name: 'Use this address' })
    .click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('radio', { name: /Milano, Via Brera/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(pageErrors).toEqual([]);
});

test('checkout allows a manual address after saved addresses fail to load', async ({ page }) => {
  await seedAuth(page);
  await page.route(`${api}/addresses`, (route) =>
    route.fulfill({ status: 503, json: { message: 'Unavailable' } }),
  );
  await page.goto('/checkout');

  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await expect(page.getByRole('button', { name: 'Place order' })).toBeEnabled();
  await expect(page.getByRole('alert').filter({ hasText: 'addresses' })).toBeVisible();
});

test('checkout waits for session restore before submitting an account order', async ({ page }) => {
  await seedAuth(page);
  let releaseRestore = () => {};
  const restoreReady = new Promise<void>((resolve) => {
    releaseRestore = resolve;
  });
  await page.route(`${api}/auth/me`, async (route) => {
    await restoreReady;
    await route.fulfill({ json: user });
  });
  let authorization: string | undefined;
  await page.route(`${api}/orders`, async (route) => {
    authorization = route.request().headers().authorization;
    await route.fulfill({ json: makeOrder() });
  });
  await page.route(`${api}/orders/71`, (route) => route.fulfill({ json: makeOrder() }));

  try {
    await page.goto('/checkout');
    await page.getByRole('button', { name: /Pickup/ }).click();
    await page.getByRole('radio', { name: /NORI SUSHI.*Brera/ }).click();
    await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled();
  } finally {
    releaseRestore();
  }
  await expect(page.getByRole('button', { name: 'Place order' })).toBeEnabled();
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page).toHaveURL(/\/orders\/71$/);
  expect(authorization).toBe(`Bearer ${token}`);
});

test('order details are cleared when cancelling an order expires the session', async ({ page }) => {
  await seedAuth(page);
  await page.route(`${api}/orders/71`, (route) => route.fulfill({ json: makeOrder() }));
  await page.route(`${api}/orders/71/cancel`, (route) =>
    route.fulfill({ status: 401, json: { message: 'Unauthorized' } }),
  );
  await page.goto('/orders/71');
  await expect(page.getByText('Philadelphia')).toBeVisible();

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Cancel order' }).click();

  await expect(page.getByText('Philadelphia')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Order again' })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('nori-web-session')))
    .toBeNull();
});

test('guest order history shows a retry after a network failure', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'nori-web-guest-orders',
      JSON.stringify([{ orderId: 71, guestToken: 'guest-secret' }]),
    );
  });
  let fail = true;
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    fail ? route.abort() : route.fulfill({ json: makeOrder(true) }),
  );
  await page.goto('/orders');
  await expect(page.getByRole('alert')).toBeVisible();

  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('link', { name: /Order #71/ })).toBeVisible();
});

test('changing language preserves the checkout address draft', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/checkout');
  await expect(page.getByRole('radio', { name: /Milano, Via Torino/ })).toBeVisible();
  await page.getByRole('button', { name: 'Enter a different address' }).click();
  await page.getByLabel('Street').fill('Via Brera');
  await page.getByLabel('House').fill('23');

  await page.getByRole('button', { name: 'Русский' }).click();

  await expect(page.getByLabel('Улица')).toHaveValue('Via Brera');
  await expect(page.getByLabel('Дом')).toHaveValue('23');
  await expect(page.getByRole('button', { name: 'Подтвердить заказ' })).toBeEnabled();
});

test('a successful guest order remains accessible when its reference cannot be persisted', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'nori-web-guest-orders') {
        throw new DOMException('Storage is blocked', 'SecurityError');
      }
      setItem.call(this, key, value);
    };
  });
  let createdOrders = 0;
  await page.route(`${api}/orders/guest`, async (route) => {
    createdOrders += 1;
    await route.fulfill({ json: makeOrder(true) });
  });
  await page.route(`${api}/orders/guest/71?**`, (route) =>
    route.fulfill({ json: makeOrder(true) }),
  );

  await page.goto('/checkout');
  await page.getByLabel('Street').fill('Via Torino');
  await page.getByLabel('House').fill('12');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page).toHaveURL(/guest-orders\/71$/);
  await expect(page.getByText('Philadelphia')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable');
  expect(await page.evaluate(() => localStorage.getItem('nori-web-cart'))).toBe('[]');
  expect(createdOrders).toBe(1);
  await page.getByRole('link', { name: 'Back to orders' }).click();
  await expect(page.getByRole('link', { name: /Order #71/ })).toBeVisible();
});
