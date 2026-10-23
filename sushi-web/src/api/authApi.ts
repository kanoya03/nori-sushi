import { apiClient, ApiError } from './client';
import type { AuthResponse, AuthUser, TelegramSession } from '../types/auth';

function isUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const user = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(user.id) &&
    typeof user.id === 'number' &&
    user.id > 0 &&
    ['firstName', 'lastName', 'email', 'birthDate', 'telegramId', 'googleId'].every(
      (key) => user[key] === null || typeof user[key] === 'string',
    ) &&
    (user.gender === null || user.gender === 'MALE' || user.gender === 'FEMALE') &&
    typeof user.createdAt === 'string' &&
    typeof user.updatedAt === 'string'
  );
}

function parseAuth(value: unknown): AuthResponse {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('accessToken' in value) ||
    typeof value.accessToken !== 'string' ||
    !value.accessToken ||
    !('user' in value) ||
    !isUser(value.user)
  ) {
    throw new ApiError('Invalid authentication response.', 0, 'response');
  }
  return { accessToken: value.accessToken, user: value.user };
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const user = await apiClient.get<unknown>('/auth/me', { accessToken });
  if (!isUser(user)) {
    throw new ApiError('Invalid user response.', 0, 'response');
  }
  return user;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return parseAuth(await apiClient.request('/auth/google', { method: 'POST', body: { idToken } }));
}

export async function startTelegramAuth(signal?: AbortSignal): Promise<TelegramSession> {
  const data = await apiClient.request<TelegramSession>('/auth/telegram/start', {
    method: 'POST',
    signal,
  });
  let validLink = false;
  try {
    const url = new URL(data.telegramUrl);
    validLink =
      url.protocol === 'https:' && url.hostname === 't.me' && !url.username && !url.password;
  } catch {
    /* Reject unexpected links before offering to open them. */
  }
  if (!validLink || typeof data.sessionToken !== 'string' || !data.sessionToken) {
    throw new ApiError('Invalid Telegram session.', 0, 'response');
  }
  return data;
}

export async function verifyTelegramCode(
  sessionToken: string,
  code: string,
): Promise<AuthResponse> {
  return parseAuth(
    await apiClient.request('/auth/telegram/verify', {
      method: 'POST',
      body: { sessionToken, code },
    }),
  );
}
