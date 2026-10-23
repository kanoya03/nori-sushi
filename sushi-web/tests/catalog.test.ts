import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, formatWeight } from '../src/utils/formatters.ts';
import {
  getCategoryName,
  getProductDescription,
  getProductName,
} from '../src/utils/productLocalization.ts';
import { mapApiProduct } from '../src/api/productMapper.ts';
import { filterProducts } from '../src/utils/filterProducts.ts';
import { products, categories } from './fixtures.ts';

test('matches the mobile fixed conversion, precision, and KZT formatting', () => {
  assert.equal(formatPrice(4290, 'en'), '$9.3');
  assert.equal(formatPrice(460, 'en'), '$1.0');
  assert.equal(formatPrice(0, 'en'), '$0.0');
  assert.equal(formatPrice(4290, 'ru'), '4\u00a0290 ₸');
  assert.equal(formatWeight('250 г', 'en'), '250 g');
  assert.equal(formatWeight('500 мл', 'en'), '500 ml');
  assert.equal(formatWeight('250 г', 'ru'), '250 г');
});

test('preserves backend identifiers, source prices, category fields, and image URLs', () => {
  const mapped = mapApiProduct(products[0]);
  assert.equal(mapped.id, 1);
  assert.equal(mapped.price, 4290);
  assert.equal(mapped.image, products[0].imageUrl);
  assert.equal(mapped.categoryId, 1);
  assert.equal(mapped.categorySlug, 'rolls');
  assert.equal(mapped.categoryEn, 'Rolls');
});

test('uses backend English fields and falls back to Russian for missing translations', () => {
  const translated = mapApiProduct(products[0]);
  const fallback = mapApiProduct(products[1]);
  assert.equal(getProductName(translated, 'en'), 'Philadelphia');
  assert.equal(getProductName(translated, 'ru'), 'Филадельфия');
  assert.equal(getProductDescription(translated, 'en'), 'Salmon, cream cheese, cucumber');
  assert.equal(getProductName(fallback, 'en'), 'Калифорния');
  assert.equal(getProductDescription(fallback, 'en'), products[1].description);
  assert.equal(getCategoryName({ ...categories[0], nameEn: null }, 'en'), 'Роллы');
});

test('combines category and bilingual search without changing the source catalog', () => {
  const mapped = products.map(mapApiProduct);
  assert.deepEqual(
    filterProducts(mapped, 'rolls', '').map((item) => item.id),
    [1, 2],
  );
  assert.deepEqual(
    filterProducts(mapped, null, '  PHILADELPHIA ').map((item) => item.id),
    [1],
  );
  assert.deepEqual(
    filterProducts(mapped, null, 'лосось').map((item) => item.id),
    [1],
  );
  assert.equal(filterProducts(mapped, 'drinks', 'Philadelphia').length, 0);
  assert.equal(filterProducts(mapped, 'unknown-category', '').length, 0);
  assert.equal(filterProducts([], null, '').length, 0);
  assert.equal(mapped.length, 3);
  assert.equal(mapped[0].price, 4290);
});
