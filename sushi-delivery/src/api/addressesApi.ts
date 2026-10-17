import { apiClient } from './client';

export type Address = {
  id: number;
  city: string;
  street: string;
  house: string;

  apartment: string | null;
  entrance: string | null;
  floor: string | null;
  comment: string | null;

  latitude: number | null;
  longitude: number | null;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
};

export type CreateAddressData = {
  city: string;
  street: string;
  house: string;

  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;

  latitude?: number;
  longitude?: number;

  isDefault?: boolean;
};

export type UpdateAddressData =
  Partial<CreateAddressData>;

export const getAddresses = (
  accessToken: string
): Promise<Address[]> => {
  return apiClient.getWithAuth<Address[]>(
    '/addresses',
    accessToken
  );
};

export const createAddress = (
  accessToken: string,
  data: CreateAddressData
): Promise<Address> => {
  return apiClient.postWithAuth<Address>(
    '/addresses',
    accessToken,
    data
  );
};

export const updateAddress = (
  accessToken: string,
  addressId: number,
  data: UpdateAddressData
): Promise<Address> => {
  return apiClient.patchWithAuth<Address>(
    `/addresses/${addressId}`,
    accessToken,
    data
  );
};

export const deleteAddress = (
  accessToken: string,
  addressId: number
): Promise<void> => {
  return apiClient.deleteWithAuth<void>(
    `/addresses/${addressId}`,
    accessToken
  );
};