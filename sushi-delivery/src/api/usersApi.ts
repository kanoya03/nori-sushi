import { apiClient } from './client';

import type {
  AuthUser,
  Gender,
} from './authApi';

export type UpdateProfileData = {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  birthDate?: string;
  email?: string;
};

export const getProfile = (
  accessToken: string
): Promise<AuthUser> => {
  return apiClient.getWithAuth<AuthUser>(
    '/users/me',
    accessToken
  );
};

export const updateProfile = (
  accessToken: string,
  data: UpdateProfileData
): Promise<AuthUser> => {
  return apiClient.patchWithAuth<AuthUser>(
    '/users/me',
    accessToken,
    data
  );
};