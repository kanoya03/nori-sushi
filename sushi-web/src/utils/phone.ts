import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export function normalizePhoneNumber(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 32) {
    return null;
  }
  const input = value.trim();
  if (!/^\+[\d\s().-]+$/.test(input)) {
    return null;
  }
  try {
    const phone = parsePhoneNumberFromString(input, { extract: false });
    return phone?.isValid() && !phone.ext ? phone.number : null;
  } catch {
    return null;
  }
}
