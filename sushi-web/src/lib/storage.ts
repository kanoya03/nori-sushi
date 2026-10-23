export function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const SESSION_KEY = 'nori-web-session';
export function readSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
export function saveSessionToken(token: string | null): boolean {
  try {
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return true;
  } catch {
    return false;
  }
}
