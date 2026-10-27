import * as SecureStore from 'expo-secure-store';
import { normalizePhoneNumber } from './phone';

const KEY = 'noriGuestPhone';
let memory: string | undefined;

export async function readGuestPhone(): Promise<string> {
  if (memory !== undefined) return memory;
  try { return normalizePhoneNumber(await SecureStore.getItemAsync(KEY)) ?? ''; } catch { return ''; }
}

export async function saveGuestPhone(phone: string): Promise<void> {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return;
  memory = normalized;
  try { await SecureStore.setItemAsync(KEY, normalized); } catch { /* Keep it for this visit. */ }
}
