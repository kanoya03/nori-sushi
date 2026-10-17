import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const GUEST_ORDERS_KEY =
  'guestOrders';

export type GuestOrderReference = {
  orderId: number;
  guestToken: string;
};

type GuestOrdersState = {
  orders: GuestOrderReference[];
  isRestored: boolean;

  restoreGuestOrders:
    () => Promise<void>;

  addGuestOrder: (
    orderId: number,
    guestToken: string
  ) => Promise<void>;

  removeGuestOrder: (
    orderId: number
  ) => Promise<void>;
};

const saveGuestOrders = async (
  orders: GuestOrderReference[]
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      GUEST_ORDERS_KEY,
      JSON.stringify(orders)
    );
  } catch (error) {
    console.error(
      'Failed to save guest orders:',
      error
    );
  }
};

const readGuestOrders =
  async (): Promise<
    GuestOrderReference[]
  > => {
    try {
      const saved =
        await SecureStore.getItemAsync(
          GUEST_ORDERS_KEY
        );

      if (!saved) {
        return [];
      }

      const parsed: unknown =
        JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (
          item
        ): item is GuestOrderReference =>
          typeof item === 'object' &&
          item !== null &&
          typeof (
            item as GuestOrderReference
          ).orderId === 'number' &&
          typeof (
            item as GuestOrderReference
          ).guestToken === 'string'
      );
    } catch (error) {
      console.error(
        'Failed to restore guest orders:',
        error
      );

      return [];
    }
  };

export const useGuestOrdersStore =
  create<GuestOrdersState>(
    (set, get) => ({
      orders: [],
      isRestored: false,

      restoreGuestOrders:
        async () => {
          if (get().isRestored) {
            return;
          }

          const orders =
            await readGuestOrders();

          set({
            orders,
            isRestored: true,
          });
        },

      addGuestOrder:
        async (
          orderId,
          guestToken
        ) => {
          const withoutDuplicate =
            get().orders.filter(
              (item) =>
                item.orderId !==
                orderId
            );

          const nextOrders = [
            {
              orderId,
              guestToken,
            },
            ...withoutDuplicate,
          ];

          set({
            orders: nextOrders,
          });

          await saveGuestOrders(
            nextOrders
          );
        },

      removeGuestOrder:
        async (
          orderId
        ) => {
          const nextOrders =
            get().orders.filter(
              (item) =>
                item.orderId !==
                orderId
            );

          set({
            orders: nextOrders,
          });

          await saveGuestOrders(
            nextOrders
          );
        },
    })
  );