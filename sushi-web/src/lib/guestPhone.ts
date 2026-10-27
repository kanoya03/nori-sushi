import { normalizePhoneNumber } from '../utils/phone';

const KEY = 'nori-web-guest-phone';
let memory: string | undefined;

export function readGuestPhone(): string {
  if (memory !== undefined) {
    return memory;
  }
  try {
    return normalizePhoneNumber(localStorage.getItem(KEY)) ?? '';
  } catch {
    return '';
  }
}

export function saveGuestPhone(phone: string): void {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) {
    return;
  }
  memory = normalized;
  try {
    localStorage.setItem(KEY, normalized);
  } catch {
    /* Keep it for this visit. */
  }
}
