import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { getGuestOrder, getOrders } from '../api/commerceApi';
import { readGuestOrderRefs } from '../lib/guestOrders';
import { useAuthStore } from '../store/authStore';
import type { Order } from '../types/commerce';

export function useOrders() {
  const token = useAuthStore((state) => state.accessToken);
  const authStatus = useAuthStore((state) => state.status);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setOrders([]);
    setError(false);
    setLoading(true);

    if (authStatus === 'idle' || authStatus === 'restoring' || authStatus === 'authenticating') {
      return;
    }
    if (authStatus === 'error') {
      setError(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        const result = token
          ? await getOrders(token, signal)
          : await Promise.all(
              readGuestOrderRefs().map(async (ref) => {
                try {
                  return await getGuestOrder(ref.orderId, ref.guestToken, signal);
                } catch (cause) {
                  if (cause instanceof ApiError && [403, 404].includes(cause.status)) {
                    return null;
                  }
                  throw cause;
                }
              }),
            );

        if (!signal.aborted) {
          setOrders(result.filter((order): order is Order => order !== null));
        }
      } catch {
        if (!signal.aborted) {
          setError(true);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [token, authStatus, attempt]);

  function reload() {
    if (authStatus === 'error') {
      void useAuthStore.getState().restore();
    }
    setAttempt((current) => current + 1);
  }

  return { orders, loading, error, reload };
}
