import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCatalogStore } from '../store/catalogStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { tokenExpiresAt } from '../utils/session';

export function useAppSession() {
  const token = useAuthStore((state) => state.accessToken);
  useEffect(() => {
    void useAuthStore.getState().restore();
    void useCatalogStore.getState().load();
    let lastRefresh = Date.now();
    const refresh = () => {
      const auth = useAuthStore.getState();
      const expiry = auth.accessToken ? tokenExpiresAt(auth.accessToken) : null;
      if (expiry !== null && expiry <= Date.now()) {
        auth.logout(true);
      }
      if (Date.now() - lastRefresh < 60_000) {
        return;
      }
      lastRefresh = Date.now();
      void useCatalogStore.getState().load(true);
      void useFavoritesStore.getState().load();
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  useEffect(() => {
    if (!token) {
      return;
    }
    const expiry = tokenExpiresAt(token);
    if (expiry === null) {
      return;
    }
    const delay = Math.max(0, expiry - Date.now());
    const timer = window.setTimeout(
      () => {
        if (Date.now() >= expiry) {
          useAuthStore.getState().expire(token);
        }
      },
      Math.min(delay, 2_147_483_647),
    );
    return () => window.clearTimeout(timer);
  }, [token]);
}
