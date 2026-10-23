import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readCart,
  addToCart,
  decrementCart,
  getCartLines,
  getSubtotal,
} from '../src/utils/cart.ts';
import { mapApiProduct } from '../src/api/productMapper.ts';
import { tokenExpiresAt } from '../src/utils/session.ts';
import { products } from './fixtures.ts';

test('cart merges quantities and removes the final unit like the mobile cart', () => {
  const original = [{ productId: 1, quantity: 1 }];
  const added = addToCart(original, 1, 2);
  assert.deepEqual(added, [{ productId: 1, quantity: 3 }]);
  assert.equal(original[0].quantity, 1);
  assert.deepEqual(addToCart(added, 13), [
    { productId: 1, quantity: 3 },
    { productId: 13, quantity: 1 },
  ]);
  assert.deepEqual(decrementCart(original, 1), []);
  assert.deepEqual(decrementCart(added, 1), [{ productId: 1, quantity: 2 }]);
});

test('cart storage rejects invalid values and never trusts persisted prices', () => {
  assert.deepEqual(readCart(null), []);
  assert.deepEqual(
    readCart([
      { productId: 1, quantity: 2, price: 1, product: { name: 'fake' } },
      { productId: 2, quantity: -1 },
      { productId: 3, quantity: 1.5 },
      { productId: '4', quantity: 1 },
      null,
    ]),
    [{ productId: 1, quantity: 2 }],
  );
  assert.deepEqual(addToCart([], 1, NaN), []);
  assert.deepEqual(addToCart([], 1, Infinity), []);
  assert.deepEqual(addToCart([], 1, 1.5), []);
  assert.deepEqual(addToCart([{ productId: 1, quantity: Number.MAX_SAFE_INTEGER }], 1), [
    { productId: 1, quantity: Number.MAX_SAFE_INTEGER },
  ]);
});

test('subtotal uses refreshed backend prices and excludes unavailable IDs without deleting selections', () => {
  const entries = [
    { productId: 1, quantity: 2 },
    { productId: 13, quantity: 1 },
    { productId: 999, quantity: 3 },
  ];
  const catalog = products.map(mapApiProduct);
  assert.equal(getSubtotal(getCartLines(entries, catalog)), 9270);
  const updated = catalog.map((product) =>
    product.id === 1 ? { ...product, price: 4600 } : product,
  );
  assert.equal(getSubtotal(getCartLines(entries, updated)), 9890);
  assert.equal(getCartLines(entries, updated)[2].product, undefined);
  assert.equal(entries.length, 3);
});

test('JWT expiry parsing is defensive and does not supply an authenticated identity', () => {
  const payload = Buffer.from(JSON.stringify({ exp: 1900000000, sub: 1 })).toString('base64url');
  assert.equal(tokenExpiresAt(`header.${payload}.signature`), 1900000000000);
  assert.equal(tokenExpiresAt('malformed'), null);
  assert.equal(tokenExpiresAt('header.e30.signature'), null);
});
