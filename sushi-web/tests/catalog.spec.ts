import { test, expect } from '@playwright/test';
import { categories, products } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.route('**/categories', (route) => route.fulfill({ json: categories }));
  await page.route('**/products', (route) => route.fulfill({ json: products }));
  await page.route('https://images.example.test/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f3f3f3"/></svg>',
    }),
  );
});

test('loads the catalog, filters, searches, and preserves language across reloads', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('article').first()).toContainText('$9.3');
  await expect(page.getByRole('article').first()).toContainText('250 g');
  await expect(page.getByRole('article').nth(1)).toContainText('Калифорния');
  await page.getByRole('button', { name: 'Drinks', exact: true }).click();
  await expect(page).toHaveURL(/category=drinks/);
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('500 ml');
  await page.getByRole('button', { name: 'Русский', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('article')).toContainText('690 ₸');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Напитки', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.getByRole('button', { name: 'Все', exact: true }).click();
  await page.getByRole('searchbox').fill('Philadelphia');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('Филадельфия');
  await page.getByRole('searchbox').fill('not-a-dish');
  await expect(page.getByRole('heading', { name: 'Ничего не найдено' })).toBeVisible();
  await page.getByRole('button', { name: 'Показать всё меню', exact: true }).last().click();
  await expect(page.getByRole('article')).toHaveCount(3);
  expect(pageErrors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('keeps loading visible until both endpoints finish', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/categories', async (route) => {
    await pending;
    await route.fulfill({ json: categories });
  });
  await page.goto('/menu');
  await expect(page.getByRole('status')).toContainText('Loading the menu');
  await expect(page.getByRole('article')).toHaveCount(0);
  release();
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('recovers from an API failure with retry', async ({ page }) => {
  let attempt = 0;
  await page.route('**/products', async (route) => {
    attempt += 1;
    await route.fulfill(
      attempt === 1 ? { status: 503, body: 'Temporarily unavailable' } : { json: products },
    );
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('We couldn’t load the menu');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('handles empty catalogs and malformed responses', async ({ page }) => {
  await page.route('**/products', (route) => route.fulfill({ json: [] }));
  await page.goto('/menu');
  await expect(page.getByRole('heading', { name: 'Nothing on the menu here yet' })).toBeVisible();
  await page.route('**/products', (route) => route.fulfill({ json: { unexpected: true } }));
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
});

test('supports direct category URLs, missing images, navigation, and 404s', async ({ page }) => {
  await page.route('https://images.example.test/**', (route) => route.abort());
  await page.goto('/menu?category=drinks');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article').getByText('Photo unavailable')).toBeVisible();
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible()) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation')).toBeHidden();
    await page.getByRole('button', { name: 'Open navigation' }).click();
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your favourites.');
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page isn’t on the menu');
  await page.getByRole('link', { name: 'Back to the menu' }).click();
  await expect(page).toHaveURL(/\/menu$/);
  await expect(page.getByRole('article')).toHaveCount(3);
});
