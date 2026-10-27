import type { CreateOrderInput } from '../types/commerce';

const STORAGE_KEY = 'nori-web-order-attempt';
type Attempt = { scope: string; signature: string; key: string };
let memoryAttempt: Attempt | null | undefined;

function readAttempt(): Attempt | null {
  if (memoryAttempt !== undefined) {
    return memoryAttempt;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (
        typeof value === 'object' &&
        value !== null &&
        'scope' in value &&
        typeof value.scope === 'string' &&
        'signature' in value &&
        typeof value.signature === 'string' &&
        'key' in value &&
        typeof value.key === 'string'
      ) {
        return value as Attempt;
      }
    }
  } catch {
    /* Private browsing may block storage. */
  }
  return null;
}

function signature(payload: Omit<CreateOrderInput, 'idempotencyKey'>) {
  return JSON.stringify({
    ...payload,
    items: payload.items
      .map(({ productId, quantity }) => ({ productId, quantity }))
      .sort((a, b) => a.productId - b.productId),
  });
}

export function hasPendingOrderAttempt(
  scope: string,
  payload?: Omit<CreateOrderInput, 'idempotencyKey'>,
) {
  const pending = readAttempt();
  return pending?.scope === scope && (!payload || pending.signature === signature(payload));
}

export function getOrderAttemptKey(
  scope: string,
  payload: Omit<CreateOrderInput, 'idempotencyKey'>,
) {
  const requestSignature = signature(payload);
  const existing = readAttempt();
  if (existing?.scope === scope && existing.signature === requestSignature) {
    return existing.key;
  }
  const attempt = { scope, signature: requestSignature, key: crypto.randomUUID() };
  memoryAttempt = attempt;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
  } catch {
    /* See above. */
  }
  return attempt.key;
}

export function clearOrderAttemptKey(key: string) {
  if (readAttempt()?.key !== key) {
    return;
  }
  memoryAttempt = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* See above. */
  }
}
