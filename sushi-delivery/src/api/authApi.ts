import { apiClient } from './client';

export type TelegramAuthStartResponse = {
  sessionToken: string;
  telegramUrl: string;
};

export type Gender =
  | 'MALE'
  | 'FEMALE';

export type AuthUser = {
  id: number;

  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  birthDate: string | null;
  email: string | null;

  telegramId: string | null;
  googleId: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export const startTelegramAuth =
  (): Promise<TelegramAuthStartResponse> => {
    return apiClient.post<TelegramAuthStartResponse>(
      '/auth/telegram/start'
    );
  };

export const verifyTelegramCode = (
  sessionToken: string,
  code: string
): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>(
    '/auth/telegram/verify',
    {
      sessionToken,
      code,
    }
  );
};

export const loginWithGoogle = (
  idToken: string
): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>(
    '/auth/google',
    {
      idToken,
    }
  );
};

export const getCurrentUser = (
  accessToken: string
): Promise<AuthUser> => {
  return apiClient.getWithAuth<AuthUser>(
    '/auth/me',
    accessToken
  );
};