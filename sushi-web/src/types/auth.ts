// Same public user and authentication response fields as sushi-delivery/src/api/authApi.ts.
export type AuthUser = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  birthDate: string | null;
  email: string | null;
  contactEmail: string | null;
  telegramId: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
};
export type AuthResponse = { accessToken: string; user: AuthUser };
export type TelegramSession = { sessionToken: string; telegramUrl: string };
