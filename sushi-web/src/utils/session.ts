// Used only for expiry UX. The backend verifies the JWT and supplies the user identity.
export function tokenExpiresAt(token: string): number | null {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload: unknown = JSON.parse(atob(part));
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'exp' in payload &&
      typeof payload.exp === 'number' &&
      Number.isFinite(payload.exp)
    ) {
      return payload.exp * 1000;
    }
  } catch {
    /* The backend will reject malformed tokens on session restore. */
  }
  return null;
}
