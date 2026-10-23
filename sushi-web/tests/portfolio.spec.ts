import { test, expect } from '@playwright/test';
import { categories, products } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.route('**/categories', (route) => route.fulfill({ json: categories }));
  await page.route('**/products', (route) => route.fulfill({ json: products }));
  await page.route('**/orders', (route) => route.fulfill({ json: [] }));
});

test('promotions present three demo offers and link back to the menu', async ({ page }) => {
  await page.goto('/promotions');
  await expect(page.getByRole('heading', { level: 1, name: 'Promotions' })).toBeVisible();
  await expect(page.locator('.promotion-card')).toHaveCount(3);
  await expect(page.getByRole('note')).toContainText('demo');
  await page.getByRole('button', { name: 'Русский' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Акции');
  await expect(page.locator('.promotion-card').nth(1)).toContainText('₸');
  await page.locator('.promotions-hero a').click();
  await expect(page).toHaveURL(/\/menu$/);
});

test('about page links to menu, favorites, orders and delivery information', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1, name: 'About NORI' })).toBeVisible();
  for (const href of ['/menu', '/favorites', '/orders', '/delivery']) {
    await expect(page.locator(`.about-feature[href="${href}"]`)).toBeVisible();
  }
  await expect(page.getByText('WEB DEMO · 1.0')).toBeVisible();
});

test('notifications show a useful guest empty state and link to offers', async ({ page }) => {
  await page.goto('/notifications');
  await expect(page.getByRole('heading', { name: 'You are all caught up' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Special offers/ })).toHaveAttribute(
    'href',
    '/promotions',
  );
  await expect(page.getByRole('note')).toContainText('push notifications are not enabled');
});

test('search starts with a prompt, filters results, and explains an empty result', async ({
  page,
}) => {
  await page.goto('/search');
  await expect(page.getByRole('heading', { name: 'What are you craving?' })).toBeVisible();
  const search = page.getByRole('searchbox');
  await search.fill('Philadelphia');
  await expect(page.getByRole('article')).toHaveCount(1);
  await search.fill('no-such-dish');
  await expect(page.getByRole('heading', { name: 'No dishes found' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('navigation exposes every requested destination on desktop and in the responsive drawer', async ({
  page,
}) => {
  await page.goto('/menu');
  const isNarrow = await page.getByRole('button', { name: 'Open navigation' }).isVisible();
  if (isNarrow) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
  }
  for (const href of [
    '/menu',
    '/search',
    '/favorites',
    '/cart',
    '/orders',
    '/promotions',
    '/notifications',
    '/profile',
    '/about',
  ]) {
    await expect(page.locator(`#main-navigation a[href="${href}"]`)).toBeVisible();
  }
  await page.locator('#main-navigation a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about$/);
  if (isNarrow) {
    await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  }
});
