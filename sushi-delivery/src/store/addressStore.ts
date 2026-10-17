import { create } from 'zustand';

export type DeliveryType =
  | 'delivery'
  | 'pickup';

export type DeliveryAddress = {
  id?: number;
  userId?: number;

  city: string;
  street: string;
  house: string;

  apartment?: string | null;
  entrance?: string | null;
  floor?: string | null;
  comment?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  isDefault?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type PickupPoint = {
  id: number;
  name: string;
  address: string;
  coordinate: [number, number];
};

type AddressState = {
  currentAddress: DeliveryAddress | null;
  deliveryType: DeliveryType;
  selectedPickupPoint: PickupPoint | null;

  setCurrentAddress: (
    address: DeliveryAddress
  ) => void;

  clearCurrentAddress: () => void;

  setDeliveryType: (
    type: DeliveryType
  ) => void;

  setSelectedPickupPoint: (
    point: PickupPoint | null
  ) => void;
};

export const useAddressStore =
  create<AddressState>((set) => ({
    currentAddress: null,
    deliveryType: 'delivery',
    selectedPickupPoint: null,

    setCurrentAddress: (
      address
    ) =>
      set({
        currentAddress: address,
      }),

    clearCurrentAddress: () =>
      set({
        currentAddress: null,
      }),

    setDeliveryType: (
      deliveryType
    ) =>
      set({
        deliveryType,
      }),

    setSelectedPickupPoint: (
      selectedPickupPoint
    ) =>
      set({
        selectedPickupPoint,
      }),
  }));