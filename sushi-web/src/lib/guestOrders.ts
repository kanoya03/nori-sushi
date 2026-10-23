const KEY = 'nori-web-guest-orders';

export type GuestOrderRef = { orderId: number; guestToken: string };

let inMemoryRefs: GuestOrderRef[] | null = null;

export function readGuestOrderRefs(): GuestOrderRef[] {
  if (inMemoryRefs) {
    return inMemoryRefs;
  }

  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KEY) || '[]');
    return Array.isArray(value)
      ? value.filter(
          (item): item is GuestOrderRef =>
            !!item &&
            Number.isSafeInteger(item.orderId) &&
            item.orderId > 0 &&
            typeof item.guestToken === 'string' &&
            item.guestToken.length > 0,
        )
      : [];
  } catch {
    return [];
  }
}

export function saveGuestOrderRef(ref: GuestOrderRef): boolean {
  const values = readGuestOrderRefs().filter((item) => item.orderId !== ref.orderId);
  inMemoryRefs = [ref, ...values];

  try {
    sessionStorage.setItem(KEY, JSON.stringify(inMemoryRefs));
    return true;
  } catch {
    return false;
  }
}
