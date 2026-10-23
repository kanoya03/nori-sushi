import type { Product } from '../types/product';

// Same merge/decrement/subtotal rules as the mobile cart. Persist no product snapshots.
export type CartEntry = { productId: number; quantity: number };
export type CartLine = CartEntry & { product: Product | undefined };
export const validId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export function readCart(value: unknown): CartEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const entries = new Map<number, CartEntry>();
  for (const entry of value) {
    if (
      typeof entry !== 'object' ||
      !entry ||
      !validId(entry.productId) ||
      !validId(entry.quantity)
    ) {
      continue;
    }
    entries.set(entry.productId, { productId: entry.productId, quantity: entry.quantity });
  }
  return [...entries.values()];
}

export function addToCart(entries: CartEntry[], productId: number, quantity = 1): CartEntry[] {
  if (!validId(productId) || !validId(quantity)) {
    return entries;
  }
  const current = entries.find((entry) => entry.productId === productId);
  if (!current) {
    return [...entries, { productId, quantity }];
  }
  if (!Number.isSafeInteger(current.quantity + quantity)) {
    return entries;
  }
  return entries.map((entry) =>
    entry.productId === productId ? { ...entry, quantity: entry.quantity + quantity } : entry,
  );
}

export function decrementCart(entries: CartEntry[], productId: number): CartEntry[] {
  return entries
    .map((entry) =>
      entry.productId === productId ? { ...entry, quantity: entry.quantity - 1 } : entry,
    )
    .filter((entry) => entry.quantity > 0);
}

export function getCartLines(entries: CartEntry[], products: Product[]): CartLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return entries.map((entry) => ({ ...entry, product: byId.get(entry.productId) }));
}

export function getSubtotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + (line.product?.price ?? 0) * line.quantity, 0);
}
